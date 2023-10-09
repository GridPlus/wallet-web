import { LandingCard } from "@/components/LandingCard";
import { PAGE_KEYS } from "@/util/constants";
import {
  CreditCardOutlined,
  InfoCircleOutlined,
  MailOutlined,
  ReconciliationOutlined,
  SearchOutlined,
  TagsOutlined,
  TwitterOutlined,
  WalletOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { faBtc } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Landing = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl text-white">Lattice Manager</h2>
      </div>
      <div>
        <h2 className="text-xl">Features</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1em",
          }}
        >
          <LandingCard
            title="Address Tags"
            body="Tag your favorite contracts or addresses"
            icon={<TagsOutlined />}
            link={PAGE_KEYS.ADDRESS_TAGS}
          />
          <LandingCard
            title="Wallet Explorer"
            body="Find and tag addresses by derivation path"
            icon={<SearchOutlined />}
            link={PAGE_KEYS.EXPLORER}
          />
          <LandingCard
            title="Bitcoin Wallet"
            body={"Check balances and send BTC transactions"}
            icon={<FontAwesomeIcon icon={faBtc} />}
            link={PAGE_KEYS.WALLET}
          />
        </div>
      </div>
      {/* <LandingCard
        title="Mint your GridPunk"
        body={
          "GridPunk digital collectibles are a gift from GridPlus to Lattice1 owners."
        }
        link={"https://gridplus.io/gridpunks"}
        imgSrc="gridpunk.png"
        className="w-80"
      /> */}
      <div>
        <h2 className="text-xl">Products</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1em",
          }}
        >
          <LandingCard
            title="Lattice1"
            body="The Hardware Wallet"
            icon={<WalletOutlined />}
            link="https://gridplus.io/lattice"
          />
          <LandingCard
            title="SafeCards"
            body="Backup or create new wallets"
            icon={<CreditCardOutlined />}
            link="https://gridplus.io/safecards"
          />
        </div>
      </div>
      <div>
        <h2 className="text-xl">Learn</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1em",
          }}
        >
          <LandingCard
            title="Documentation"
            body="Learn more about your Lattice"
            icon={<InfoCircleOutlined />}
            link="https://docs.gridplus.io"
          />
        </div>
      </div>
      <div>
        <h2 className="text-xl">Connect</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1em",
          }}
        >
          <LandingCard
            title="@GridPlus"
            body="Follow GridPlus on Twitter"
            icon={<TwitterOutlined />}
            link="https://twitter.com/GridPlus"
          />
          <LandingCard
            title="GridPlus"
            body="Subscribe to GridPlus on YouTube"
            icon={<YoutubeOutlined />}
            link="https://youtube.com/GridPlus"
          />

          <LandingCard
            title="Newsletter"
            body="Subscribe for the latest from GridPlus"
            icon={<MailOutlined />}
            link="https://gridplus.io/subscribe"
          />
          <LandingCard
            title="Survey"
            body="Help us improve your experience"
            icon={<ReconciliationOutlined />}
            link="https://gridplus.io/survey"
          />
        </div>
      </div>
    </div>
  );
};
