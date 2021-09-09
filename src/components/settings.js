import React from 'react';
import 'antd/dist/antd.css'
import { Button, Card, Col, Collapse, Icon, Input, Row, Switch, Table } from 'antd'
import './styles.css'
import { constants, getLocalStorageSettings } from '../util/helpers';
const settingsPath = `${constants.ROOT_STORE}/settings`

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: {
        customEndpoint: '',
        keyringLogins: {},
      },
      local: {},
    }

    this.getSettings();
  }

  componentDidMount() {
    this.getSettings();
  }

  getSettings() {
    const settings = getLocalStorageSettings();
    this.setState({ settings })
  }

  hasActiveWallet() {
    // Make sure we have an active session with a device
    if (!this.props.session) 
      return false;
    // Make sure we have an active wallet
    if (!this.props.session.getActiveWallet())
      return false
    return true;
  }

  submit() {
    // Save the settings to local storage
    const storage = JSON.parse(window.localStorage.getItem(constants.ROOT_STORE) || '{}');
    storage.settings = this.state.settings
    window.localStorage.setItem(constants.ROOT_STORE, JSON.stringify(storage));
    // Reload the page for the changes to take effect
    window.location.reload();
  }

  updateUseCustomEndpoint(value) {
    const settings = JSON.parse(JSON.stringify(this.state.settings));
    const local = this.state.local;
    local.useCustomEndpoint = value;
    if (value !== true) {
      // Reset the custom endpoint if this value is false
      settings.customEndpoint = '';
    }
    this.setState({ settings, local });
  }

  updateCustomEndpoint(evt) {
    const settings = JSON.parse(JSON.stringify(this.state.settings));
    settings.customEndpoint = evt.target.value;
    this.setState({ settings });
  }

  updateBitcoinUseBech32(value) {
    // Make sure we have an active session with a Lattice
    if (!this.hasActiveWallet())
      return;
    const settings = JSON.parse(JSON.stringify(this.state.settings));
    settings.bitcoinUseBech32 = value;
    this.setState({ settings })

    // Clear all addresses so we can re-sync with the new flag.
    // I have chosen to wipe *all* addresses rather than picking over BTC only ones.
    // This is just for simplicity. We only load one ETH address anyway.
    // However, if more assets get supported we can re-evaluate this policy.
    const deviceID = this.props.session.deviceID;
    const walletUID = this.props.session.getActiveWallet().uid.toString('hex');
    const walletData = this.props.session.storageSession.getWalletData(deviceID, walletUID);
    console.log('walletData', walletData)
    walletData.addresses = {};
    this.props.session.storageSession.save(deviceID, walletUID, walletData);
  }

  removeKeyring(login) {
    const settings = this.state.settings || {};
    delete settings.keyringLogins[login.name]
    this.setState({ settings })
  }

  renderCustomEndpointSetting() {
    const { customEndpoint='' } = this.state.settings;
    let { useCustomEndpoint=false } = this.state.local;
    if (customEndpoint !== '')
      useCustomEndpoint = true;
    return (
      <Card>
        <h3>(Advanced) Connection Endpoint:</h3>
        <p><i>
          If you wish to route messages and connections through your own endpoint, you may specify it here. 
          See <a href="https://github.com/GridPlus/lattice-connect" target="_blank">this</a> for more information.
        </i></p>
        <p><b>Use Custom:</b></p>
        <Switch checked={useCustomEndpoint} onChange={this.updateUseCustomEndpoint.bind(this)}/>
        {useCustomEndpoint === true ? (
          <div>
            <br/>
            <p><b>Custom Endpoint:</b></p>
            <Input  placeholder="host:port" 
                    defaultValue={customEndpoint} 
                    onChange={this.updateCustomEndpoint.bind(this)}/>
          </div>
        ) : null}
        <br/>
      </Card>
    )
  }

  renderKeyringsSetting() {
    const { keyringLogins = {} } = this.state.settings;
    const cols = [
      { 
        title: 'App Name', 
        dataIndex: 'name', 
        key: 'name'
      }, 
      { 
        title: 'Action', 
        dataIndex: 'action', 
        key: 'action',
        render: (text, record) => (
          <Button type="link" onClick={() => {this.removeKeyring(record)}}>Forget</Button>
        ) 
      }
    ]
    const data = [];
    Object.keys(keyringLogins)
      .sort((a, b) => { return a.toLowerCase() > b.toLowerCase() ? 1 : -1 })
      .forEach((name) => { data.push({ name }) })
    return (
      <Card>
        <h3>Third Party Connections</h3>
        <p><i>
          You may forget a third party here and next time you use the app you will be prompted to create a new one.
        </i></p>
        <Collapse>
          <Collapse.Panel header={`Connections List (${data.length})`}>
            <Table dataSource={data} columns={cols}/>
          </Collapse.Panel>
        </Collapse>
      </Card>
    )
  }

  renderBitcoinSettings() {
    // We only want to allow this toggle if we have state from the device.
    // This is because it will reset all BTC addresses.
    if (!this.hasActiveWallet())
      return;
    let bitcoinUseBech32 = this.state.settings.bitcoinUseBech32;
    if (bitcoinUseBech32 === undefined)
      bitcoinUseBech32 = true;
    return (
      <Card>
        <h3>Bitcoin Settings:</h3>
        <div> {
          this.props.session ? (
            <div>
              <p><b>Use native segwit (bech32):</b></p>
              <Switch checked={bitcoinUseBech32} onChange={this.updateBitcoinUseBech32.bind(this)}/>
            </div>
          ) : null}
        </div>
      </Card>
    )
  }

  renderSettingsCard() {
    return (
      <Card title={'Settings'} bordered={true}>
        {this.renderKeyringsSetting()}
        {this.renderCustomEndpointSetting()}
        {this.renderBitcoinSettings()}
        <br/>
        <Button type="primary" onClick={this.submit.bind(this)}>
          Update and Reload
        </Button>
      </Card>
    )
  }

  render() {
    const content = (
      <center>
        {this.renderSettingsCard()}
      </center>      
    )
    return (this.props.isMobile() || this.props.inModal) ? content : (
      <Row justify={'center'}>
        <Col span={14} offset={5} style={{maxWidth: '600px'}}>
          {content}
        </Col>
      </Row>
    )
  }
}

export default Settings