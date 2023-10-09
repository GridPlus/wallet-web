import { PlusOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import { useAddressTags } from "../hooks/useAddressTags";
import { Plus } from "lucide-react";

export const AddAddressTagsButton = ({ showModal }) => {
  const { isLoadingAddressTags } = useAddressTags();

  return (
    <Button
      variant="outline"
      onClick={showModal}
      disabled={isLoadingAddressTags}
    >
      <Plus size={14} />
      Add
    </Button>
  );
};
