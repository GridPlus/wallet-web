import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { PAGE_KEYS } from "@/util/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { pair } from "gridplus-sdk";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useUrlParams } from "../hooks/useUrlParams";

const formSchema = z.object({
  pairingCode: z.string().length(8),
});

export const PairPage = () => {
  const navigate = useNavigate();
  const { keyring } = useUrlParams();
  const [isPairing, setIsPairing] = useState(false);
  const { toast } = useToast();

  const wasOpenedByKeyring = !!keyring; // Was the app opened with a keyring in the url parameters

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pairingCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPairing(true);
    const pairingCode = values.pairingCode.toUpperCase();
    pair(pairingCode)
      .then(() => {
        navigate(PAGE_KEYS.MANAGER);
        if (wasOpenedByKeyring) {
          // TODO: fix return keyring
          // return returnKeyringData(deviceId, password); TODO
        }
      })
      .catch((err) => {
        toast({
          title: "Pairing Error",
          description: err.errorMessage,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsPairing(false);
      });
  }

  const onCancel = () => {
    navigate(PAGE_KEYS.ROOT);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="w-[400px] mt-20">
            <CardHeader className="text-center">
              <CardTitle>Lattice Manager</CardTitle>
              <CardDescription>Connect to your Lattice1</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="pairingCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paring Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter paring Code" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is code should be displayed on your device
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-evenly">
              <Button variant="ghost" onClick={onCancel} disabled={isPairing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPairing}>
                {isPairing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pair
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};
