import { LoadingOutlined } from "@ant-design/icons";
import { Button, Input, Table } from "antd";
import fuzzysort from "fuzzysort";
import intersectionBy from "lodash/intersectionBy";
import React, { useCallback, useEffect, useState } from "react";
import { useAddressTags } from "../hooks/useAddressTags";
import { abbreviateHash } from "../util/addresses";
import { ADDRESSES_PER_PAGE } from "@/util/constants";

/**
 * `AddressTable` is a table of key-value pairs of names and hashes with some management features to
 * make it easier to manage a large amount of addressTags.
 */
export const AddressTable = () => {
  const { isLoadingAddressTags, addressTags, removeAddressTags } =
    useAddressTags();
  const [input, setInput] = useState("");
  const [filteredAddressTags, setFilteredAddressTags] = useState([]);
  const [selectedAddressTags, setSelectedAddressTags] = useState([]);

  useEffect(() => {
    setInput("");
    setFilteredAddressTags(addressTags);
  }, [addressTags, isLoadingAddressTags]);

  const filter = useCallback(
    (value) =>
      fuzzysort
        .go(value, addressTags, { keys: ["key", "val"] })
        .map((x) => x.obj),
    [addressTags]
  );

  const handleOnSelect = (_, __, _selectedAddressTags) => {
    setSelectedAddressTags(_selectedAddressTags);
  };

  const handleOnSelectAll = (_, _selectedAddressTags) => {
    setSelectedAddressTags(_selectedAddressTags);
  };

  const onChange = ({ target: { value } }) => {
    setInput(value);
    const _addressTags = value ? filter(value) : addressTags;
    setFilteredAddressTags(_addressTags);
    setSelectedAddressTags(
      intersectionBy(selectedAddressTags, _addressTags, "key")
    );
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Input
          value={input}
          placeholder="Filter"
          disabled={isLoadingAddressTags}
          onChange={onChange}
          style={{ marginBottom: "1em" }}
          allowClear
        />
        <Button
          danger
          type="text"
          disabled={selectedAddressTags.length === 0}
          onClick={() =>
            removeAddressTags(selectedAddressTags).then(() => {
              setSelectedAddressTags([]);
            })
          }
          style={{ marginLeft: "1em" }}
        >
          Remove Selected
        </Button>
      </div>
      <Table
        dataSource={filteredAddressTags}
        tableLayout="fixed"
        loading={{
          spinning: isLoadingAddressTags,
          tip: "Loading...",
          indicator: <LoadingOutlined />,
        }}
        pagination={{
          position: ["bottomCenter"],
          pageSize: ADDRESSES_PER_PAGE,
          defaultCurrent: 1,
          showSizeChanger: false,
        }}
        rowSelection={{
          type: "checkbox",
          onSelect: handleOnSelect,
          onSelectAll: handleOnSelectAll,
          selectedRowKeys: selectedAddressTags.map((x) => x.key),
        }}
      >
        <Table.Column
          title="Name"
          dataIndex="val"
          key="val"
          defaultSortOrder="ascend"
          sorter={(a: any, b: any) => a.val.localeCompare(b.val)}
        />
        <Table.Column
          title="Address"
          dataIndex="key"
          key="key"
          render={(key) => abbreviateHash(key)}
          sorter={(a: any, b: any) => a.key.localeCompare(b.key)}
        />
      </Table>
    </div>
  );
};
