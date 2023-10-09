import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Input } from "antd";
import { useSettings } from "@/hooks/useSettings";
import { BASE_SIGNING_URL } from "@/util/constants";

export const ConnectionButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [error, setIsError] = useState(false);

  const { settings, setSettings } = useSettings();
  const { customEndpoint = BASE_SIGNING_URL } = settings;

  let circleClass = "bg-gray-500 shadow-glow-gray"; // Default color and shadow
  let connectionText = "Disconnected";
  if (isConnected) {
    circleClass = "bg-green-500 shadow-glow-green";
    connectionText = "Connected";
  } else if (isConnecting) {
    circleClass = "bg-yellow-500 shadow-glow-yellow";
    connectionText = "Connecting...";
  } else if (isDisconnected) {
    circleClass = "bg-red-500 shadow-glow-red";
    connectionText = "Disconnected";
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    console.log({ event: evt.target });
    const newEndpoint = evt.target[0].value;
    updateCustomEndpoint(newEndpoint);
  };

  const updateCustomEndpoint = (newEndpoint: string) => {
    checkForConnection(newEndpoint).then((status) => {
      if (status) {
        settings.customEndpoint = newEndpoint;
        setSettings(settings);
        setIsDialogOpen(false);
      }
    });
  };

  const checkForConnection = async (customEndpoint: string) => {
    setIsConnecting(true);
    setIsError(false);
    const status = await fetch(customEndpoint)
      .then((res) => res.text())
      .then((body) => {
        if (body === "OK") {
          setIsConnected(true);
          setIsError(false);
          return true;
        } else {
          setIsDisconnected(true);
          setIsError(true);
          return false;
        }
      })
      .finally(() => {
        setIsConnecting(false);
      });
    return status;
  };

  useEffect(() => {
    setIsConnecting(true);
    checkForConnection(customEndpoint);
  }, [customEndpoint]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDialogOpen) {
        checkForConnection(customEndpoint);
      }
    }, 100000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${circleClass} mr-2`}></div>
            {connectionText}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Connection</DialogHeader>
        <div>
          <div className="mb-1">
            <h3 className="text-lg font-semibold ">Connection Endpoint</h3>
            <p className="text-md text-zinc-500  ">
              Enter the host and port of your self-hosted transaction routing
              service.{" "}
              <a
                href="https://github.com/GridPlus/lattice-connect-v2"
                className="text-slate-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </a>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex">
            <div className="flex flex-col gap-5 w-full mt-3">
              <Input
                placeholder="host:port"
                defaultValue={customEndpoint}
                className={`w-full ${error ? "border-red-500" : ""}`}
                onSelect={() => setIsError(false)}
                onBlur={() => setIsError(false)}
              />
              {error && (
                <p className="text-red-500">
                  Could not connect to the provided endpoint. Please try again.
                </p>
              )}
              <div className="flex w-full justify-between gap-5">
                <Button
                  onClick={() => updateCustomEndpoint(BASE_SIGNING_URL)}
                  variant="ghost"
                  className="w-full"
                >
                  Reset
                </Button>
                <Button type="submit" variant="outline" className="w-full">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
