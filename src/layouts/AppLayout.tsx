import { Layout } from "antd";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LoadingCard } from "../components/LoadingCard";
import { useLattice } from "../hooks/useLattice";
import { BitcoinContextProvider } from "../store/BitcoinContext";
import { DesktopNavbar } from "@/components/DesktopNavbar";
import { Toaster } from "@/components/ui/toaster";

export const AppLayout = () => {
  const { isLoadingClient, handleLogout, updateActiveWallets } = useLattice();

  useEffect(() => {
    updateActiveWallets();
  }, []);

  return (
    <>
      <BitcoinContextProvider>
        {isLoadingClient && (
          <LoadingCard
            spin={true}
            msg="Locating your Lattice..."
            onCancel={() => {
              handleLogout();
            }}
          />
        )}
        {!isLoadingClient && (
          <div className="md:mx-auto max-w-[400px] md:max-w-screen-xl md:p-5">
            <DesktopNavbar />
            <div className="my-5">
              <Outlet />
            </div>
          </div>
        )}
      </BitcoinContextProvider>
      <Toaster />
    </>
  );
};
