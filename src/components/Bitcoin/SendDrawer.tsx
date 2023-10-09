import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SendBtcForm } from "@/components/Bitcoin/SendBtcForm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function SendDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Card className="hover:bg-secondary cursor-pointer flex-grow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Send</div>
            <p className="text-xs text-muted-foreground">
              Send Bitcoin to another address
            </p>
          </CardContent>
        </Card>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Send BTC</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <SendBtcForm />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
