import { Button } from "@/components/ui/button";
import { useAddressTags } from "../hooks/useAddressTags";
import { RefreshCcw } from "lucide-react";

export const SyncAddressTagsButton = () => {
  const { fetchAddressTags, isLoadingAddressTags, resetAddressTagsInState } =
    useAddressTags();

  return (
    <Button
      variant="link"
      disabled={isLoadingAddressTags}
      onClick={() => {
        resetAddressTagsInState();
        fetchAddressTags();
      }}
    >
      <RefreshCcw size={14} className="mr-2" />
      Sync
    </Button>
  );
};
