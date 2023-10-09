import { abbreviateHash } from "@/util/addresses";
import { BTC_TX_BASE_URL } from "@/util/constants";
import { formatRelativeTime } from "@/util/datetime";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { useBtcTransactions } from "@/hooks/useBtcTransactions";
import { useMemo } from "react";

export const BtcTxsTable = () => {
  const { transactionsForTable } = useBtcTransactions();

  const btcTxs = useMemo(() => {
    if (transactionsForTable) {
      return Object.values(transactionsForTable);
    }
    return [];
  }, [transactionsForTable]);

  return (
    <ScrollArea className="h-[500px]">
      <Table className="text-xs md:text-base">
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Hash ID</TableHead>
            <TableHead>Direction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {btcTxs.map((tx) => (
            <TableRow key={tx.txid}>
              <TableCell>{tx.status}</TableCell>
              <TableCell>{`${tx.amount / Math.pow(10, 8)} BTC`}</TableCell>
              <TableCell>{tx.recipient}</TableCell>
              <TableCell>{tx.timestamp}</TableCell>
              <TableCell>
                <Link to={`${BTC_TX_BASE_URL}/${tx.txid}`} target="_blank">
                  {abbreviateHash(tx.txid)}
                </Link>
              </TableCell>
              <TableCell>
                {tx.incoming ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </ScrollArea>
  );
};

// Generates a random hexadecimal string, commonly used for IDs in blockchain-related objects.
function generateRandomHex(size) {
  return [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

// Generates a random boolean value.
function generateRandomBoolean() {
  return Math.random() < 0.5;
}

// Generates a random Bitcoin address. Note: This is a mock function and generates a placeholder value.
function generateBitcoinAddress() {
  return `bc1q${generateRandomHex(33)}`;
}

// Generates a random integer within a specified range.
function generateRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main function to generate a list of data objects.
export function generateDataList(length) {
  const dataList = [];

  for (let i = 0; i < length; i++) {
    const value = generateRandomInt(10000, 10000000);
    const addr = generateBitcoinAddress();
    dataList.push({
      timestamp: Date.now() - generateRandomInt(0, 100000000),
      confirmed: generateRandomBoolean(),
      id: generateRandomHex(64),
      fee: generateRandomInt(1000, 300000),
      inputs: [
        {
          addr: generateBitcoinAddress(),
          value: generateRandomInt(10000000, 10000000000),
        },
      ],
      outputs: [
        {
          addr,
          value,
        },
      ],
      incoming: generateRandomBoolean(),
      recipient: addr,
      value,
    });
  }

  return dataList;
}
