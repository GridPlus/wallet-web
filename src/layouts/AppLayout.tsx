import { Layout } from "antd";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LoadingCard } from "../components/LoadingCard";
import { useLattice } from "../hooks/useLattice";
import { BitcoinContextProvider } from "../store/BitcoinContext";
import { DesktopNavbar } from "@/components/DesktopNavbar";
import { Toaster } from "@/components/ui/toaster";
const { Content } = Layout;

export const AppLayout = () => {
  const navigate = useNavigate();
  const {
    isLoadingClient,
    isConnected,
    isAuthenticated,
    handleLogout,
    updateActiveWallets,
  } = useLattice();

  // useEffect(() => {
  //   if (!isAuthenticated()) {
  //     navigate(PAGE_KEYS.ROOT);
  //   }
  // }, [isAuthenticated, navigate]);

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
          // <Layout style={{ minHeight: "100vh" }} hasSider>
          // <AppSidebar />
          // <Content>
          <div className="md:mx-auto max-w-[400px] md:max-w-screen-xl md:p-5">
            <DesktopNavbar />
            <div className="my-5">
              <Outlet />
            </div>
          </div>
          // </Content>
          // </Layout>
        )}
      </BitcoinContextProvider>
      <Toaster />
    </>
  );
};
