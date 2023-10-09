import { useSettings } from "@/hooks/useSettings";
import { BTC_PURPOSE_NONE, PAGE_KEYS } from "@/util/constants";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader } from "./ui/card";

export const LandingCard = ({
  icon,
  title,
  body,
  link,
  imgSrc,
  ...props
}: {
  title: string;
  body: string;
  link: string;
  icon?: React.ReactNode;
  imgSrc?: string;
}) => {
  const navigate = useNavigate();
  const { btcPurpose } = useSettings();
  const isBtcWalletActive = () => BTC_PURPOSE_NONE !== btcPurpose;

  return (
    <div style={{ flexGrow: 1, flexBasis: 0 }} {...props}>
      <a
        onClick={(event) => {
          // if (link === PAGE_KEYS.SETTINGS) {
          //   event.preventDefault();
          //   if (isBtcWalletActive()) {
          //     navigate(PAGE_KEYS.WALLET);
          //   } else {
          //     navigate(PAGE_KEYS.SETTINGS);
          //   }
          // }
          if (link === PAGE_KEYS.ADDRESS_TAGS) {
            event.preventDefault();
            navigate(PAGE_KEYS.ADDRESS_TAGS);
          }
          if (link === PAGE_KEYS.EXPLORER) {
            event.preventDefault();
            navigate(PAGE_KEYS.EXPLORER);
          }
        }}
        href={link}
        className="lattice-a"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Card className="hover:bg-zinc-900 h-full">
          {imgSrc && (
            <img
              src={imgSrc}
              alt="lattice-one-device"
              style={{ maxWidth: "250px" }}
            />
          )}
          <CardHeader>
            <h2 className="text-lg text-primary h-100">
              <span className="pr-3">{icon ? icon : null}</span>
              {title}
            </h2>
            <CardDescription>
              <p className="text-md text-zinc-500">{body}</p>
            </CardDescription>
          </CardHeader>
        </Card>
      </a>
    </div>
  );
};
