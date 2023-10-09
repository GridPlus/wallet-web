import { useSettings } from "@/hooks/useSettings";
import { BTC_PURPOSE_NONE, PAGE_KEYS } from "@/util/constants";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  HomeOutlined,
  SettingOutlined,
  TagsOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Menu, MenuProps } from "antd";
import Sider from "antd/lib/layout/Sider";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppFooter } from "./AppFooter";

type MenuItem = Required<MenuProps>["items"][number];

export const AppSidebar = () => {
  const navigate = useNavigate();
  const { btcPurpose } = useSettings();
  const hideWallet = BTC_PURPOSE_NONE === btcPurpose;

  const MenuItems = useMemo(() => {
    const items: MenuItem[] = [
      {
        key: "",
        label: "Home",
        icon: <HomeOutlined />,
      },
      {
        key: PAGE_KEYS.ADDRESS_TAGS,
        label: "Address Tags",
        icon: <TagsOutlined />,
      },
      {
        key: PAGE_KEYS.EXPLORER,
        label: "Explorer",
        icon: <TagsOutlined />,
      },
    ];
    if (!hideWallet) {
      items.push({
        key: "subwallet",
        label: "BTC Wallet",
        children: [
          {
            key: PAGE_KEYS.WALLET,
            label: "History",
            icon: <WalletOutlined />,
          },
        ],
      });
    }
    return items;
  }, [hideWallet]);

  const handleMenuSelect = ({ key }: { key: string }) => {
    navigate(`${key}`);
  };

  return (
    <Sider collapsedWidth={0} breakpoint="lg">
      <a
        className="lattice-a"
        href="https://gridplus.io"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          alt="GridPlus"
          src={"/gridplus-logo.png"}
          style={{ width: "100%" }}
        />
      </a>
      <Menu
        theme="dark"
        mode="inline"
        onSelect={handleMenuSelect}
        items={MenuItems}
      />
      <AppFooter />
    </Sider>
  );
};
