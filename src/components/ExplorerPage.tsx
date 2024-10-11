import { LoadingOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Input, Select, Table, Tooltip } from "antd";
import { fetchAddressesByDerivationPath } from "gridplus-sdk";
import { useEffect, useState } from "react";
import { useAddressTags } from "../hooks/useAddressTags";
import { abbreviateHash } from "../util/addresses";
import {
  DERIVATION_TYPE,
  getDisplayStringForDerivationType,
} from "../util/derivation";
import { constants } from "../util/helpers";
import { sendErrorNotification } from "../util/sendErrorNotification";
import { AddressTagInput } from "./AddressTagInput";
import { PageContent } from "./formatting";
import { UpdateAddressTagsModal } from "./UpdateAddressTagsModal";

const { ADDRESSES_PER_PAGE } = constants;
const { Option } = Select;

const ExplorerPage = () => {
  const { addressTags } = useAddressTags();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddAddressesModalVisible, setIsAddAddressesModalVisible] =
    useState(false);
  // m / purpose' / coin_type' / account' / change / index
  const [purpose, setPurpose] = useState<number | string>(44);
  const [isPurposeHardened, setIsPurposeHardened] = useState(true);
  const [coinType, setCoinType] = useState<number | string>(60);
  const [isCoinTypeHardened, setIsCoinTypeHardened] = useState(true);
  const [account, setAccount] = useState<number | string>(0);
  const [isAccountHardened, setIsAccountHardened] = useState(true);
  const [change, setChange] = useState<number | string>(0);
  const [isChangeHardened, setIsChangeHardened] = useState(false);
  const [index, setIndex] = useState<number | string>(0);
  const [isIndexHardened, setIsIndexHardened] = useState(false);
  const [selectedDerivationType, setSelectedDerivationType] = useState(
    DERIVATION_TYPE.ETHEREUM
  );

  const getInitialAddressTags = () => {
    return addresses.map((addr) => {
      if (addr.record && addr.record.id) {
        return { key: addr.record.key, val: addr.record.val };
      }
      return { key: addr.address, val: "" };
    });
  };

  const getPath = () => {
    const HARDENED_OFFSET = 0x80000000;
    const segments = [
      { value: purpose, isHardened: isPurposeHardened },
      { value: coinType, isHardened: isCoinTypeHardened },
      { value: account, isHardened: isAccountHardened },
      { value: change, isHardened: isChangeHardened },
      { value: index, isHardened: isIndexHardened },
    ];

    return segments
      .map(({ value, isHardened }) => {
        if (value === "X") return "X";
        const numValue =
          typeof value === "number" ? value : parseInt(value as string, 10);
        return isHardened
          ? (HARDENED_OFFSET + numValue).toString()
          : numValue.toString();
      })
      .filter((x) => Boolean(x) && !isNaN(parseInt(x)))
      .join("/");
  };

  const getAddrs = () => {
    setIsLoading(true);
    const pathString = getPath();
    fetchAddressesByDerivationPath(pathString, { n: ADDRESSES_PER_PAGE })
      .then((addrs) => {
        setAddresses(
          addrs.map((addr) => ({
            address: getDisplayStringForDerivationType(
              addr,
              selectedDerivationType
            ),
            record: addressTags.find((t) => t.key === addr),
          }))
        );
      })
      .catch(sendErrorNotification)
      .finally(() => setIsLoading(false));
  };

  const addrsColumns = [
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => <p>{abbreviateHash(text)}</p>,
    },
    {
      title: "Tag",
      dataIndex: "record",
      key: "tag",
      render: (record, { address }) => (
        <AddressTagInput
          record={record}
          address={address}
          fetchAddressTags={getAddrs}
        />
      ),
    },
  ];

  const onCheck = (e, checkedSetter) => {
    checkedSetter(e.target.checked);
  };

  useEffect(() => {
    getAddrs();
  }, [selectedDerivationType]);

  const onSelect = (option) => {
    if (option === DERIVATION_TYPE.ETHEREUM) {
      setPurpose(44);
      setIsPurposeHardened(true);
      setCoinType(60);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.BITCOIN_LEGACY) {
      setPurpose(44);
      setIsPurposeHardened(true);
      setCoinType(0);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.BITCOIN_SEGWIT) {
      setPurpose(84);
      setIsPurposeHardened(true);
      setCoinType(0);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.BITCOIN_WRAPPED_SEGWIT) {
      setPurpose(49);
      setIsPurposeHardened(true);
      setCoinType(0);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.SOLANA) {
      setPurpose(44);
      setIsPurposeHardened(true);
      setCoinType(501);
      setIsCoinTypeHardened(true);
      setAccount("X");
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(true);
      setIndex(null);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
  };

  const handleInputChange = (
    value: number | string,
    setter: React.Dispatch<React.SetStateAction<number | string>>
  ) => {
    if (value === "X") {
      // Clear other "X" values
      if (purpose === "X") setPurpose(44);
      if (coinType === "X") setCoinType(60);
      if (account === "X") setAccount(0);
      if (change === "X") setChange(0);
      if (index === "X") setIndex(0);
    }
    setter(value);
  };

  return (
    <PageContent>
      <Card title={"Wallet Explorer"} bordered>
        <div>
          <h3>Standard Derivation Paths</h3>
          <div style={{ paddingBottom: "25px" }}>
            <Select
              defaultValue={DERIVATION_TYPE.ETHEREUM}
              onChange={onSelect}
              style={{ width: "100%" }}
              disabled={isLoading}
            >
              <Option value={DERIVATION_TYPE.ETHEREUM}>Ethereum</Option>
              <Option value={DERIVATION_TYPE.BITCOIN_LEGACY}>
                Bitcoin (Legacy)
              </Option>
              <Option value={DERIVATION_TYPE.BITCOIN_SEGWIT}>
                Bitcoin (Segwit)
              </Option>
              <Option value={DERIVATION_TYPE.BITCOIN_WRAPPED_SEGWIT}>
                Bitcoin (Wrapped Segwit)
              </Option>
              <Option value={DERIVATION_TYPE.SOLANA}>Solana</Option>
            </Select>
          </div>
          <h3>Derivation Path</h3>
          <div
            style={{
              paddingBottom: "25px",
              display: "flex",
              gap: "10px",
              justifyContent: "stretch",
              flexWrap: "wrap",
            }}
          >
            <Input
              disabled={isLoading}
              addonBefore={
                <Tooltip title="Harden">
                  <Checkbox
                    disabled={isLoading}
                    checked={isPurposeHardened}
                    onChange={(e) => onCheck(e, setIsPurposeHardened)}
                  />
                </Tooltip>
              }
              addonAfter={`${isPurposeHardened ? "'" : ""}`}
              onChange={(e) => handleInputChange(e.target.value, setPurpose)}
              value={purpose}
              style={{ width: "125px" }}
            />
            <Input
              disabled={isLoading}
              addonBefore={
                <Tooltip title="Harden">
                  <Checkbox
                    disabled={isLoading}
                    checked={isCoinTypeHardened}
                    onChange={(e) => onCheck(e, setIsCoinTypeHardened)}
                  />
                </Tooltip>
              }
              addonAfter={`${isCoinTypeHardened ? "'" : ""}`}
              onChange={(e) => handleInputChange(e.target.value, setCoinType)}
              value={coinType}
              style={{ width: "125px" }}
            />
            <Input
              disabled={isLoading}
              addonBefore={
                <Tooltip title="Harden">
                  <Checkbox
                    disabled={isLoading}
                    checked={isAccountHardened}
                    onChange={(e) => onCheck(e, setIsAccountHardened)}
                  />
                </Tooltip>
              }
              addonAfter={`${isAccountHardened ? "'" : ""}`}
              onChange={(e) => handleInputChange(e.target.value, setAccount)}
              value={account}
              style={{ width: "125px" }}
            />
            <Input
              disabled={isLoading}
              addonBefore={
                <Tooltip title="Harden">
                  <Checkbox
                    disabled={isLoading}
                    checked={isChangeHardened}
                    onChange={(e) => onCheck(e, setIsChangeHardened)}
                  />
                </Tooltip>
              }
              addonAfter={`${isChangeHardened ? "'" : ""}`}
              onChange={(e) => handleInputChange(e.target.value, setChange)}
              value={change}
              style={{ width: "125px" }}
            />
            <Input
              disabled={isLoading}
              addonBefore={
                <Tooltip title="Harden">
                  <Checkbox
                    disabled={isLoading}
                    checked={isIndexHardened}
                    onChange={(e) => onCheck(e, setIsIndexHardened)}
                  />
                </Tooltip>
              }
              addonAfter={`${isIndexHardened ? "'" : ""}`}
              onChange={(e) => handleInputChange(e.target.value, setIndex)}
              value={index}
              style={{ width: "125px" }}
            />
            <Button
              onClick={() => getAddrs()}
              disabled={isLoading}
              type="primary"
            >
              Sync
            </Button>
            {/*  TODO: Handle modifying all addresses 
              <Button
                type="ghost"
                onClick={()=>setIsAddAddressesModalVisible(true))}
                disabled={isLoading || isLoadingAddressTags}
              >
                Edit All
              </Button> 
            */}
          </div>
          <Table
            dataSource={addresses}
            columns={addrsColumns}
            tableLayout="fixed"
            rowKey={(record) => record.address}
            loading={{
              spinning: isLoading,
              tip: "Loading...",
              indicator: <LoadingOutlined />,
            }}
            pagination={false}
          />
        </div>
        <UpdateAddressTagsModal
          isModalVisible={isAddAddressesModalVisible}
          setIsModalVisible={setIsAddAddressesModalVisible}
          initialAddressTags={getInitialAddressTags()}
        />
      </Card>
    </PageContent>
  );
};

export default ExplorerPage;
