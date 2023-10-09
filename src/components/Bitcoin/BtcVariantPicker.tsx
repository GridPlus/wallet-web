import { useSettings } from "@/hooks/useSettings";
import {
  BTC_PURPOSE_LEGACY,
  BTC_PURPOSE_LEGACY_STR,
  BTC_PURPOSE_NONE,
  BTC_PURPOSE_SEGWIT,
  BTC_PURPOSE_SEGWIT_STR,
  BTC_PURPOSE_WRAPPED_SEGWIT,
  BTC_PURPOSE_WRAPPED_SEGWIT_STR,
} from "@/util/constants";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";

export const BtcVariantPicker = () => {
  const { settings, setSettings } = useSettings();

  const purpose = settings.btcPurpose?.toString() ?? "";

  const bitcoinWalletVariants = [
    {
      value: BTC_PURPOSE_SEGWIT.toString(),
      label: BTC_PURPOSE_SEGWIT_STR,
    },
    {
      value: BTC_PURPOSE_WRAPPED_SEGWIT.toString(),
      label: BTC_PURPOSE_WRAPPED_SEGWIT_STR,
    },
    {
      value: BTC_PURPOSE_LEGACY.toString(),
      label: BTC_PURPOSE_LEGACY_STR,
    },
  ];

  const updateBitcoinVariantInSettings = (value) => {
    setSettings((settings) => ({ ...settings, btcPurpose: parseInt(value) }));
  };

  const activeVariantLabel = bitcoinWalletVariants.find(
    (item) => item.value === purpose
  )?.label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{activeVariantLabel}</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="mb-2">
          <h3 className="text-lg font-semibold ">Bitcoin Wallet Variant</h3>
          <p className="text-md text-zinc-500">
            Choose which address variant to use when transferring Bitcoin with
            Lattice Manager.
          </p>
        </div>

        <RadioGroup
          defaultValue={purpose}
          onValueChange={updateBitcoinVariantInSettings}
        >
          {bitcoinWalletVariants.map((item) => {
            return (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={item.value} id={item.value} />
                <Label htmlFor={item.value}>{item.label}</Label>
              </div>
            );
          })}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
};
