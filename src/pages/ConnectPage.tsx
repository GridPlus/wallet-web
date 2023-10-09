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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { PAGE_KEYS } from "@/util/constants";
import { InfoCircleOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { setup } from "gridplus-sdk";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { NameEditor } from "../components/NameEditor";
import { useLattice } from "../hooks/useLattice";
import { useUrlParams } from "../hooks/useUrlParams";

const formSchema = z.object({
  deviceId: z.string().min(6).max(50),
  password: z.string().min(8).max(256),
});

export const ConnectPage = () => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const getStoredClient = () =>
    window.localStorage.getItem("storedClient") || "";

  const setStoredClient = (storedClient: string | null) => {
    if (!storedClient) return;
    window.localStorage.setItem("storedClient", storedClient);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceId: "",
      password: "",
    },
  });

  useEffect(() => {
    if (getStoredClient()) {
      setup({ getStoredClient, setStoredClient }).then((isPaired) => {
        if (isPaired) {
          window.location.href = "/manage";
        }
      });
    }
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsConnecting(true);
    const deviceId = values.deviceId;
    const password = values.password;
    const name = "Lattice Manageryyyy"; //todo: reset to normal
    await setup({
      deviceId,
      password,
      name,
      getStoredClient,
      setStoredClient,
    })
      .then((isPaired) => {
        if (isPaired) {
          navigate(PAGE_KEYS.MANAGER);
        } else {
          navigate(PAGE_KEYS.PAIR);
        }
      })
      .catch((err) => {
        console.log({ err });
        toast({
          title: "Connection Error",
          description: err.errorMessage,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsConnecting(false);
      });
  }

  const { keyring } = useUrlParams();
  const { integrationName, setIntegrationName } = useLattice();
  const wasOpenedByKeyring = !!keyring; // Was the app opened with a keyring in the url parameters

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="w-[400px] mt-20">
            <CardHeader className="text-center">
              {wasOpenedByKeyring ? (
                <>
                  <CardTitle>Connect To</CardTitle>
                  <NameEditor
                    name={integrationName}
                    setName={setIntegrationName}
                  />
                </>
              ) : (
                <CardTitle>Lattice Manager</CardTitle>
              )}
              <CardDescription>Connect to your Lattice1</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <FormLabel>
                            <div className="items-center flex gap-2">
                              Device ID
                              <InfoCircleOutlined className="text-gray-500" />
                            </div>
                          </FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Unlock your Lattice and find its Device ID on the
                            main menu. This is a six-character code.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Enter device ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="h-4" />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <FormLabel>
                            <div className="items-center flex gap-2">
                              Password
                              <InfoCircleOutlined className="text-gray-500" />
                            </div>
                          </FormLabel>
                        </TooltipTrigger>
                        <TooltipContent className="w-72">
                          <p>
                            If this is your first time connecting, you can
                            create a new password.
                          </p>
                          <p>
                            This does not secure any value and is not associated
                            with your wallet seed - it is only used to send
                            secure requests to your device.
                          </p>
                          <p>
                            If you lose your password, you can remove the
                            permission on your device and re-connect with a new
                            one.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button type="submit" disabled={isConnecting}>
                {isConnecting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Connect
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};
