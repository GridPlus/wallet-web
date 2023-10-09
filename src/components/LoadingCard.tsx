import { LoadingOutlined } from "@ant-design/icons";
import { Button, Card, Spin } from "antd";

export const LoadingCard = ({
  spin,
  msg,
  onCancel,
}: {
  spin: boolean;
  msg: string;
  onCancel?: () => void;
}) => {
  return (
    <Card
      title="Loading"
      bordered={true}
      style={{
        textAlign: "center",
        maxWidth: "500px",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "25px",
      }}
    >
      {spin !== false ? <Spin indicator={<LoadingOutlined />} /> : null}
      <p>{msg ? msg : "Waiting for data from your Lattice"}</p>
      {onCancel ? (
        <Button type="link" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
    </Card>
  );
};
