import * as React from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  HomeOutlined,
  SettingOutlined,
  TagsOutlined,
  WalletOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/util";
import { Link } from "react-router-dom";
import { ConnectionButton } from "./ConnectionButton";
import { LogoutButton } from "./LogoutButton";
import { WalletButton } from "./WalletButton";
import { PAGE_KEYS } from "@/util/constants";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { FileSearch, FileSearch2Icon } from "lucide-react";

const MenuItems = [
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
  {
    key: "btc",
    label: "BTC Wallet",
    children: [
      {
        key: PAGE_KEYS.WALLET,
        label: "History",
        icon: <WalletOutlined />,
      },
    ],
  },
];

export function DesktopNavbar() {
  return (
    <NavigationMenu className="flex justify-between max-w-full flex-wrap">
      <NavigationMenuList className="flex-wrap space-x-5 justify-center my-3">
        <NavigationMenuItem>
          <Link to="https://gridplus.io">
            <div>
              <img
                src={"/gridplus-logo.png"}
                alt="GridPlus"
                className="object-contain w-[80px]"
              />
            </div>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button asChild variant="outline">
            <Link
              to={PAGE_KEYS.MANAGER}
              className={navigationMenuTriggerStyle()}
            >
              <HomeOutlined className="mr-2" /> Home
            </Link>
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button asChild variant="outline">
            <Link
              to={PAGE_KEYS.ADDRESS_TAGS}
              className={navigationMenuTriggerStyle()}
            >
              <TagsOutlined className="mr-2" />
              Address Tags
            </Link>
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button asChild variant="outline">
            <Link
              to={PAGE_KEYS.EXPLORER}
              className={navigationMenuTriggerStyle()}
            >
              <FileSearchOutlined className="mr-2" />
              Explorer
            </Link>
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button asChild variant="outline">
            <Link
              to={PAGE_KEYS.WALLET}
              className={navigationMenuTriggerStyle()}
            >
              <WalletOutlined className="mr-2" />
              Bitcoin Wallet
            </Link>
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuList className="space-x-5 flex flex-wrap space-1">
        <NavigationMenuItem>
          <ConnectionButton />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <WalletButton key="wallet-button" />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <LogoutButton key="logout-button" />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
