import { Client } from 'gridplus-sdk';
import { harden, fetchStateData, constants } from '../util/helpers';
import { default as StorageSession } from '../util/storageSession';
import worker from '../stateWorker.js';
import WebWorker from '../WebWorker';
const Buffer = require('buffer/').Buffer;
const ReactCrypto = require('gridplus-react-crypto').default;

class SDKSession {
  constructor(deviceID, stateUpdateHandler) {
    this.client = null;
    this.crypto = null;
    // Cached list of addresses, indexed by currency
    this.addresses = {};
    // Cached balances (in currency units), indexed by currency
    this.balances = {};
    this.usdValues = {};
    // Cached list of transactions, indexed by currency
    this.txs = {};
    // Make use of localstorage to persist wallet data
    this.storageSession = null;
    // Save the device ID for the session
    this.deviceID = deviceID;
    // Handler to call when we get state updates
    this.stateUpdateHandler = stateUpdateHandler;
    // Web worker to sync blockchain data in the background
    this.worker = null;
    this.updateStorage();
    
  }

  disconnect() {
    this.client = null;
    this.saveStorage();
    this.storageSession = null;
    this.deviceId = null;
    this.worker.postMessage({ type: 'stop' });
    this.worker = null;
  }

  isConnected() {
    return this.client !== null;
  }

  isPaired() {
    return this.client.isPaired || false;
  }

  getBalance(currency) {
    return this.balances[currency] || 0;
  }

  getUSDValue(currency) {
    return this.usdValues[currency] || 0;
  }

  getTxs(currency) {
    return this.txs[currency] || [];
  }

  getAddresses(currency) {
    return this.addresses[currency] || [];
  }

  getActiveWallet() {
    if (!this.client) return null;
    return this.client.getActiveWallet();
  }

  // Setup a web worker to periodically lookup state data
  setupWorker() {
    this.worker = new WebWorker(worker);
    this.worker.addEventListener('message', e => {
      switch (e.data.type) {
        case 'dataResp':
          // Got data; update state here and let the main component know
          this.fetchDataHandler(e.data.data);
          this.stateUpdateHandler();
          break;
        case 'error':
          // Error requesting data, report it to the main component.
          if (this.stateUpdateHandler)
            this.stateUpdateHandler({ err: e.data.data, currency: e.data.currency });
          break;
        case 'iterationDone':
          // Done looping through our set of currencies for the given iteration
          // Refresh wallets to make sure we are synced
          this.refreshWallets(() => {
            this.stateUpdateHandler();
          })
          break;
        default:
          break;
      }
    })
    this.worker.postMessage({ type: 'setup', data: constants.GRIDPLUS_CLOUD_API })
    this.worker.postMessage({ type: 'setAddresses', data: this.addresses });
  }

  fetchDataHandler(data) {
    const { currency, balance, transactions } = data;
    this.balances[currency] = balance.value;
    this.usdValues[currency] = balance.dollarAmount;
    this.txs[currency ] = transactions;
  }

  fetchData(currency, cb) {
    fetchStateData(currency, this.addresses, (err, data) => {
      if (err) return cb(err);
      this.fetchDataHandler(data);
      return cb(null);
    })
  }


  // Load a set of addresses based on the currency and also based on the current
  // list of addresses we hold. Note that we are operating under a specific walletUID.
  // The walletUID maps 1:1 to a wallet seed and therefore the addresses of any provided
  // indices will ALWAYS be the same. Thus, we don't need to re-request them unless
  // we lose localStorage, which is also captured via a StorageSession.
  // Therefore, we can always assume that the addresses we have are "immutable" given
  // current state params (walletUID and StorageSession).
  loadAddresses(currency, cb) {
    if (!this.client) return cb('No client connected');
    const opts = {};

    // Get the current address list for this currency
    let currentAddresses = this.addresses[currency];
    if (!currentAddresses) currentAddresses = [];
    const nextIdx = currentAddresses.length;

    switch(currency) {
      case 'BTC':
        // TODO: Bitcoin syncing logic. We need to consider a gap limit of 20
        // for regular addresses and a gap limit of 1 for change addresses.
        // TODO: Call the webworker when we get new addresses so that it can sync
        // over the new ones too
        if (nextIdx > 0) return cb(null); // Temporary to avoid reloading all the time
        opts.startPath = [ harden(44), constants.BTC_COIN, harden(0), 0, nextIdx ];
        opts.n = 1;
        break;
      case 'ETH':
        // Do not load addresses if we already have the first ETH one.
        // We will only ever use one ETH address, so callback success here.
        if (nextIdx > 0) return cb(null);
        // If we don't have any addresses here, let's get the first one
        opts.startPath = [ harden(44), harden(60), harden(0), 0, nextIdx ];
        opts.n = 1;
        break;
      default:
        return cb('Invalid currency to request addresses');
    }
    this.client.getAddresses(opts, (err, addresses) => {
      if (err) return cb(err);
      // Save the addresses to memory and also update them in localStorage
      // Note that we do need to track index here
      this.addresses[currency] = addresses;
      this.saveStorage();
      return cb(null);
    })
  }

  saveStorage() {
    // This function should never be called without a deviceID 
    // or StorageSession
    if (!this.deviceID || !this.storageSession) return;

    // Package data and save it
    // NOTE: We are only storing addresses at this point, as
    // the blockchain state needs to be up-to-date and is therefore
    // not very useful to store.
    const walletData = {
      addresses: this.addresses,
    };
    const activeWallet = this.client ? this.client.getActiveWallet() : null;
    if (this.client && activeWallet !== null) {
      const wallet_uid = activeWallet.uid.toString('hex');
      this.storageSession.save(this.deviceID, wallet_uid, walletData);
    }
  }

  updateStorage() {
    // Create a storage session only if we have a deviceID and don't
    // have a current storage session
    if (this.deviceID && !this.storageSession)
      this.storageSession = new StorageSession(this.deviceID);
    if (this.client) {
      // If we have a client and if it has a non-zero active wallet UID,
      // lookup the addresses corresponding to that wallet UID in storage.
      const activeWallet = this.getActiveWallet();
      if (activeWallet === null) {
        // No active wallet -- reset addresses and tell the worker to stop looking
        // for updates until we get an active wallet
        this.addresses = {};
        this.worker.postMessage({ type: 'setAddresses', data: this.addresses });
      } else {
        const uid = activeWallet.uid.toString('hex')
        // Rehydrate the data
        const walletData = this.storageSession.getWalletData(this.deviceID, uid) || {};
        this.addresses = walletData.addresses || {};
      }
    }
  }

  connect(deviceID, pw, cb, initialTimeout=constants.ASYNC_SDK_TIMEOUT) {
    // Derive a keypair from the deviceID and password
    // This key doesn't hold any coins and only allows this app to make
    // requests to a particular device. Nevertheless, the user should
    // enter a reasonably strong password to prevent unwanted requests
    // from nefarious actors.
    const key = this._genPrivKey(deviceID, pw);
    // If no client exists in this session, create a new one and
    // attach it.
    const client = new Client({ 
      name: 'GridPlus Web Wallet',
      crypto: this.crypto,
      privKey: key,
      baseUrl: 'https://signing.staging-gridpl.us',
      timeout: initialTimeout, // Artificially short timeout for simply locating the Lattice
    })
    client.connect(deviceID, (err) => {
      if (err) return cb(err);
      // Update the timeout to a longer one for future async requests
      client.timeout = constants.ASYNC_SDK_TIMEOUT;
      this.client = client;
      // Setup a new storage session if these are new credentials.
      // (This call will be bypassed if the credentials are already saved
      // in localStorage because updateStorage is also called in the constructor)
      this.deviceID = deviceID;
      this.updateStorage();
      this.setupWorker();
      return cb(null, client.isPaired);
    });
  }

  refreshWallets(cb) {
    if (this.client)
      this.client.refreshWallets((err) => {
        // Update storage. This will remap to a new localStorage key if the wallet UID
        // changed. If we didn't get an active wallet, it will just clear out the addresses
        this.updateStorage();
        cb(err);
      })
  }

  pair(secret, cb) {
    this.client.pair(secret, cb);
  }

  _genPrivKey(deviceID, pw) {
    const key = Buffer.concat([Buffer.from(pw), Buffer.from(deviceID)])
    // Create a new instance of ReactCrypto using the key as entropy
    this.crypto = new ReactCrypto(key);
    return this.crypto.createHash('sha256').update(key).digest();
  }

}

export default SDKSession