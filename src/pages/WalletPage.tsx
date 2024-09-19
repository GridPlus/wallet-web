import { BtcTxsTable } from "@/components/Bitcoin/BtcTxsTable";
import { BtcVariantPicker } from "@/components/Bitcoin/BtcVariantPicker";
import { SendDrawer } from "@/components/Bitcoin/SendDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBtc } from "@/hooks/useBtc";
import { useLattice } from "@/hooks/useLattice";
import { useSettings } from "@/hooks/useSettings";
import { initializeBtcWallet } from "@/util/btc/btc";
import { SATS_TO_BTC } from "@/util/constants";
import { formatRelativeTime } from "@/util/datetime";
import { useMemo, useState } from "react";

export const WalletPage = () => {
  const isLoadingBtcData = false;
  const lastFetchedBtcData = new Date();

  const { deviceId, activeWalletUid } = useLattice();
  const { btcPrice, balance } = useBtc();
  const { btcPurpose } = useSettings();

  const [addresses, setAddresses] = useState({});

  const btcBalanceInBtc = useMemo(() => {
    const sats = balance;
    const btc = sats / SATS_TO_BTC;
    return parseFloat(btc.toFixed(7));
  }, [addresses, balance]);

  const usdBalance = btcBalanceInBtc * btcPrice;

  const isFetchDisabled = !Boolean(activeWalletUid) || isLoadingBtcData;

  const formatUSD = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      // Additional options can be set here
    }).format(value);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-start justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bitcoin Wallet</h2>
          <span className="text-xs text-muted-foreground">
            Last updated&nbsp;{formatRelativeTime(lastFetchedBtcData)}
          </span>
        </div>

        <div className="flex gap-5">
          <BtcVariantPicker />
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={() => {
                initializeBtcWallet({
                  deviceId,
                  activeWalletUid,
                  btcPurpose,
                });
              }}
              variant="outline"
              disabled={isFetchDisabled || isLoadingBtcData}
            >
              Reload
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex w-full gap-5 justify-between flex-wrap">
          <Card className="flex-grow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{btcBalanceInBtc} BTC </div>
              <p className="text-xs text-muted-foreground">
                {formatUSD(usdBalance)} USD
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-secondary cursor-pointer flex-grow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUSD(btcPrice)}</div>
              <p className="text-xs text-muted-foreground">USD</p>
            </CardContent>
          </Card>

          <SendDrawer />

          <Card className="hover:bg-secondary cursor-pointer flex-grow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Receive</div>
              <p className="text-xs text-muted-foreground">
                Get your address to receive Bitcoin
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <BtcTxsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
