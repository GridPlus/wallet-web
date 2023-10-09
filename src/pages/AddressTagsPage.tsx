import { Card } from "antd";
import isEmpty from "lodash/isEmpty";
import { useEffect, useState } from "react";
import { AddAddressTagsButton } from "../components/AddAddressTagsButton";
import { AddAddressTagsModal } from "../components/AddAddressTagsModal";
import { AddressTable } from "../components/AddressTable";
import { ExportAddressTagsButton } from "../components/ExportAddressTagsButton";
import { ImportAddressTagsButton } from "../components/ImportAddressTagsButton";
import { ImportAddressTagsModal } from "../components/ImportAddressTagsModal";
import { SyncAddressTagsButton } from "../components/SyncAddressTagsButton";
import { useAddressTags } from "@/hooks/useAddressTags";
import { AddressTagsTable } from "@/components/AddressTagTable";

export const AddressTagsPage = () => {
  const { fetchAddressTags, isLoadingAddressTags, addressTags } =
    useAddressTags();
  const [isAddAddressTagsModalVisible, setIsAddAddressTagsModalVisible] =
    useState(false);
  const [isImportAddressTagsModalVisible, setIsImportAddressTagsModalVisible] =
    useState(false);

  const [initialAddressTags, setInitialAddressTags] = useState([
    { key: null, val: null },
  ]);

  useEffect(() => {
    if (isEmpty(addressTags) && !isLoadingAddressTags) {
      fetchAddressTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extra = [
    <SyncAddressTagsButton key="sync-addressTags-button" />,
    <AddAddressTagsButton
      key="add-addressTags-button"
      showModal={() => setIsAddAddressTagsModalVisible(true)}
    />,
    <ImportAddressTagsButton
      showModal={() => setIsImportAddressTagsModalVisible(true)}
      key="import-addressTags-button"
    />,
    <ExportAddressTagsButton key="export-addressTags-button" />,
  ];

  return (
    <>
      <Card title={"Address Tags"} extra={extra} bordered>
        <AddressTagsTable />
      </Card>
      <AddAddressTagsModal
        isModalVisible={isAddAddressTagsModalVisible}
        setIsModalVisible={setIsAddAddressTagsModalVisible}
        initialAddressTags={initialAddressTags}
      />
      <ImportAddressTagsModal
        isModalVisible={isImportAddressTagsModalVisible}
        setIsAddAddressTagsModalVisible={setIsAddAddressTagsModalVisible}
        setIsModalVisible={setIsImportAddressTagsModalVisible}
        setInitialAddressTags={setInitialAddressTags}
      />
    </>
  );
};
