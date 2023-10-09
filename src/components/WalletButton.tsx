import { CheckOutlined, CreditCardOutlined } from "@ant-design/icons";

import { useMemo, useState } from "react";
import { useLattice } from "../hooks/useLattice";
import { Tooltip } from "antd";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function isEmptyUInt8Array(arr: Uint8Array): boolean {
  return arr.every((el) => el === 0);
}

export const WalletButton = () => {
  const {
    updateActiveWallets,
    activeWallets,
    isLoadingActiveWallets: isLoading,
    deviceId,
  } = useLattice();

  const buttonData = useMemo(() => {
    if (activeWallets) {
      const isExternalActive = !isEmptyUInt8Array(activeWallets.external.uid);

      if (isExternalActive) {
        return {
          icon: <CreditCardOutlined className="mr-2 h-4 w-4" />,
          label: "SafeCard",
        };
      } else {
        return {
          icon: <CheckOutlined className="mr-2 h-4 w-4" />,
          label: deviceId,
        };
      }
    }
    return {
      type: "danger",
      label: "Loading Wallet...",
      icon: <></>,
    };
  }, [activeWallets]);

  return (
    <Tooltip title="Click to reload wallet" key="WalletTagTooltip">
      <Button variant="outline" onClick={updateActiveWallets}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          buttonData.icon
        )}
        {isLoading ? "Loading" : buttonData.label}
      </Button>
    </Tooltip>
  );
};
