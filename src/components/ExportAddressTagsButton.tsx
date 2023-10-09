import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useAddressTags } from "../hooks/useAddressTags";
import { addressTagsToCsvString } from "../util/csv";

export const ExportAddressTagsButton = () => {
  const { isLoadingAddressTags, addressTags } = useAddressTags();

  const handleOnClick = () => {
    const csv = addressTagsToCsvString(addressTags);
    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    let csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "SavedAddressTags.csv");
    tempLink.click();
  };

  return (
    <Button
      variant="outline"
      disabled={isLoadingAddressTags}
      onClick={handleOnClick}
    >
      <FileUp size={14} className="mr-2" />
      Export
    </Button>
  );
};
