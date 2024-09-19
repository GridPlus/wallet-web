import { CheckOutlined, CreditCardOutlined } from "@ant-design/icons";

import { Button } from "@/components/ui/button";
import { Tooltip } from "antd";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useLattice } from "../hooks/useLattice";

function isEmptyUInt8Array(arr: Uint8Array): boolean {
  return arr.every((el) => el === 0);
}

export const WalletButton = () => {
  const {
    updateActiveWallets,
    activeWallets,
    isLoadingActiveWallets,
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
        {isLoadingActiveWallets ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          buttonData.icon
        )}
        {isLoadingActiveWallets ? "Loading" : buttonData.label}
      </Button>
    </Tooltip>
  );
};
