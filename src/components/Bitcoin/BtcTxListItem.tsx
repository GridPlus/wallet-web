import { BTC_TX_BASE_URL } from "@/util/constants";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Avatar, Button, List } from "antd";

export const BtcTxListItem = ({ item }) => {
  // Label to view transaction on explorer
  const label = (
    <div>
      {item.confirmed ? (
        <p>
          {item.incoming ? "Received " : "Sent "}
          {getDateDiffStr(item.timestamp)} ago
        </p>
      ) : null}
      <Button
        size="small"
        href={`${BTC_TX_BASE_URL}/${item.id}`}
        target="_blank"
      >
        View
      </Button>
    </div>
  );
  if (item.value === 0) {
    // This is an internal transaction, meaning all spenders and recipients
    // are addresses we control
    return (
      <List.Item key={item.hash}>
        <List.Item.Meta
          avatar={<Avatar src={"/BTC.png"} />}
          title="Internal Transaction"
          description="This transaction sender and recipient are your addresses."
        />
        {label}
      </List.Item>
    );
  }
  // Information about the transaction
  const title = `${item.value / Math.pow(10, 8)} BTC`;
  const subtitle = item.recipient;
  const itemMeta = (
    <List.Item.Meta
      avatar={<Avatar src={"/BTC.png"} />}
      title={
        item.confirmed ? (
          <p>{`${title}`}</p>
        ) : (
          <p>
            <i>{`${title}`}</i>
          </p>
        )
      }
      description={
        item.confirmed ? (
          <p>
            {item.incoming ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            {`${subtitle}`}
          </p>
        ) : (
          <p>
            {item.incoming ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            <i>{`${subtitle}`}</i>
          </p>
        )
      }
    />
  );
  return (
    <List.Item key={item.hash}>
      {itemMeta}
      {label}
    </List.Item>
  );
};
// Get a human readable, string representation of the difference
// between two dates
function getDateDiffStr(ts) {
  const then = new Date(ts);
  const now = new Date();
  const min = 1000 * 60;
  const hour = min * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = week * 4;
  const year = month * 12;

  //@ts-expect-error
  const diff = now - then;

  if (diff / min < 1) {
    return "seconds";
  } else if (diff / hour < 1) {
    return `${Math.floor(diff / min)} minutes`;
  } else if (diff / day < 1) {
    return `${Math.floor(diff / hour)} hours`;
  } else if (diff / week < 1) {
    return `${Math.floor(diff / day)} days`;
  } else if (diff / month < 1) {
    return `${Math.floor(diff / week)} weeks`;
  } else if (diff / year < 1) {
    return `${Math.floor(diff / month)} months`;
  } else {
    return `${Math.floor(diff / year)} years`;
  }
}
