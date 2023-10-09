import { CONTRACT_NETWORKS, DEFAULT_CONTRACT_NETWORK } from "@/util/constants";
import { Select } from "antd";
const { Option } = Select;

export const SelectNetwork = ({ setNetwork }) => {
  return (
    <Select
      style={{ minWidth: "150px", marginRight: "10px" }}
      showSearch
      defaultValue={DEFAULT_CONTRACT_NETWORK}
      optionFilterProp="children"
      onChange={setNetwork}
      filterOption={(input, option) =>
        //@ts-ignore
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {Object.entries(CONTRACT_NETWORKS).map(([key, value]) => (
        <Option key={key} value={key}>
          {value.label}
        </Option>
      ))}
    </Select>
  );
};
