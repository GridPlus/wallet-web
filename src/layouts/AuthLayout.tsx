import { PAGE_KEYS } from "@/util/constants";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { LoadingCard } from "../components/LoadingCard";
import { useLattice } from "../hooks/useLattice";
import { ConnectionButton } from "@/components/ConnectionButton";

export const AuthLayout = () => {
  const navigate = useNavigate();
  const { isLoadingClient, handleLogout, isAuthenticated } = useLattice();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(PAGE_KEYS.MANAGER);
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
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
        <div className="m-5">
          <ConnectionButton />
          <Outlet />
          <AppFooter />
        </div>
      )}
    </>
  );
};
