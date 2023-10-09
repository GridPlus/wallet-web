import { CopyOutlined } from "@ant-design/icons";
import { Card, Empty, Input, Row } from "antd";
import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";

const { Search, TextArea } = Input;
const SEARCH_ID = "address-data";

export const ReceivePage = () => {
  const getBtcDisplayAddress = () => "";

  const copyAddress = () => {
    const copy = document.getElementById(SEARCH_ID);
    //@ts-expect-error
    copy.select();
    document.execCommand("copy");
  };

  const address = useMemo(() => getBtcDisplayAddress(), []);
  // Sanity check on BTC address checksum
  // if (!validateBtcAddr(address)) return;

  return (
    <Card title={"Receive BTC"} bordered={true} id="receive-card">
      {address ? (
        <div className="flex flex-col gap-5 max-w-[800px] mx-auto">
          <Row justify="center">
            <QRCodeSVG value={address} size={200} />
          </Row>
          <Row justify="center">
            <Search
              type="text"
              id={SEARCH_ID}
              value={address}
              enterButton={<CopyOutlined />}
              onSearch={copyAddress}
            />
          </Row>
        </div>
      ) : (
        <div>
          <p>No addresses found</p>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </Card>
  );
};
