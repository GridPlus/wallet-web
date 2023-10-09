import {
  BTC_DEFAULT_FEE_RATE,
  BTC_TX_BASE_URL,
  SATS_TO_BTC,
} from "@/util/constants";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useBtc } from "@/hooks/useBtc";
import { useBtcAddresses } from "@/hooks/useBtcAddresses";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { notification } from "antd";
import { getClient, sign } from "gridplus-sdk";
import { useEffect, useState } from "react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import { isValid, z } from "zod";
import { buildBtcTxReq, getBtcNumTxBytes } from "../../util/helpers";
import { useBtcUTXOs } from "@/hooks/useBtcUtxos";
import { broadcastTransaction } from "@/util/btc/btc";
import console from "console";

const sendSchema = z.object({
  recipient: z.string(),
  // .regex(/^(1|3|[bc1])[a-zA-HJ-NP-Z0-9]{25,39}$/, "Invalid BTC address"),
  value: z.any(),
  // .max(btcBalance, "Value exceeds available balance"),
  fee: z.number().positive("Fee must be greater than 0").optional(),
});

type SendFormData = z.infer<typeof sendSchema>;

export const SendBtcForm = () => {
  const [recipient, setRecipient] = useState("");
  const [valueCheck, setValueCheck] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [btcFeeRate, setBtcFeeRate] = useState(BTC_DEFAULT_FEE_RATE);

  const methods = useForm<SendFormData>({
    resolver: zodResolver(sendSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  const { activeBtcUTXOs: btcUtxos } = useBtcUTXOs();

  const {
    activeBtcAddresses: addresses,
    activeBtcChangeAddresses: changeAddresses,
    latestBtcChangeAddress,
  } = useBtcAddresses();

  console.log({ latestBtcChangeAddress });

  const { balance: btcBalance } = useBtc();

  useEffect(() => {
    fetch("https://blockstream.info/api/fee-estimates")
      .then((response) => response.json())
      .then((resp) => {
        if (resp["1"]) {
          // Expected confirmation in 1 block
          setBtcFeeRate(Math.ceil(Number(resp["1"])));
        }
        if (true) {
          // getBtcWalletData();
        }
      })
      .catch((err) => {
        console.error(`Error from fetching fee rates: ${err.toString()}`);
      });
  }, []);

  // const updateRecipient = (evt) => {
  //   const val = evt.target.value;
  //   const check = allChecks.BTC.recipient(val);
  //   setRecipient(val);
  //   setRecipientCheck(check);
  // };

  const updateBtcFeeRate = (value) => {
    setBtcFeeRate(value);
  };

  const getUrl = () => {
    return `${BTC_TX_BASE_URL}/${txHash}`;
  };

  const renderIcon = (id) => {
    const name = `${id}Check`;
    // const isValid = state[name]; // todo: fix this
    const isValid = true;
    if (isValid === true) {
      return <CheckCircleOutlined style={{ color: "green" }} />;
    } else if (isValid === false) {
      return <CloseCircleOutlined style={{ color: "red" }} />;
    } else {
      return;
    }
  };

  const calculateMaxValue = () => {
    const balance = btcBalance;
    const utxos = btcUtxos;
    // To spend all BTC, get the size of all UTXOs and calculate the fee required
    const txBytes = getBtcNumTxBytes(utxos.length);
    const feeSat = Math.floor(btcFeeRate * txBytes);
    // @ts-expect-error
    return Math.max(((balance - feeSat) / SATS_TO_BTC).toFixed(8), 0);
  };

  // const isValidReq = valueCheck && allChecks.BTC.full({ recipient, value });

  const onSubmit: SubmitHandler<SendFormData> = async (data) => {
    const req = await buildBtcTxReq(
      data.recipient,
      Number(data.value),
      btcUtxos,
      latestBtcChangeAddress,
      btcFeeRate,
      data.value === calculateMaxValue()
    );
    if (req.error) {
      // setError(req.error);
      toast({ description: req.error, variant: "destructive" });

      return null;
    } else if (!req.data) {
      toast({
        description: "Invalid response when building BTC transaction request.",
        variant: "destructive",
      });
      return null;
    }

    if (req) {
      notification.open({
        message: "Waiting for signature...",
        key: "signNotification",
        description: `We have sent the transaction to your Lattice for signing.
                      After approval, the transaction will be broadcast.`,
        duration: 0,
      });
      setIsLoading(true);

      sign(null, req)
        .then(async (res) => {
          debugger;
          await broadcastTransaction(res.tx);
        })
        .catch((err) => {
          // Display an error banner
          toast({ description: err.message });
          setIsLoading(false);
          setTxHash(null);
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
          notification.close("signNotification");
        });
    }
  };

  console.log({ errors });
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <div className="flex gap-2 items-center">
            <Label htmlFor={"recipient"}>Recipient</Label>
            <ValidIcon id="recipient" />
          </div>
          <Input type="text" {...register("recipient")} />
          {errors.recipient && <p>{errors.recipient.message}</p>}
        </div>
        <div>
          <div className="flex gap-2 items-center">
            <Label htmlFor={"value"}>Value</Label>
            <ValidIcon id="value" />
          </div>
          <div className="flex">
            <Input id="value" type="number" step="any" {...register("value")} />
            {/* <Button
              variant="outline"
              onClick={() => {
                updateValue({
                  target: {
                    value: calculateMaxValue(),
                  },
                });
              }}
            >
              Max
            </Button> */}
          </div>
        </div>
        <div>
          <Label htmlFor="fees">Fee (sat/byte)</Label>
          <Input
            id="fees"
            min={1}
            max={100}
            onChange={updateBtcFeeRate}
            value={btcFeeRate}
          />
        </div>

        <DrawerFooter>
          {/* <Button type="submit" disabled={!isValidReq || isLoading}> */}
          <Button type="submit">Send</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </form>
    </FormProvider>
  );
};

const ValidIcon = ({ id }) => {
  const {
    formState: { errors },
  } = useFormContext();

  if (isValid) {
    return <CheckCircleOutlined style={{ color: "green" }} />;
  } else {
    return <CloseCircleOutlined style={{ color: "red" }} />;
  }

  return null;
};
