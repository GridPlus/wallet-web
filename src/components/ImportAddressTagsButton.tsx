import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useAddressTags } from "../hooks/useAddressTags";

export const ImportAddressTagsButton = ({ showModal }) => {
  const { isLoadingAddressTags } = useAddressTags();

  return (
    <Button
      variant="outline"
      disabled={isLoadingAddressTags}
      onClick={showModal}
    >
      <FileDown size={14} className="mr-2" />
      Import
    </Button>
  );
};
