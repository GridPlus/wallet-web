import { Button } from "@/components/ui/button";
import { useLattice } from "../hooks/useLattice";

export const LogoutButton = () => {
  const { handleLogout } = useLattice();

  return (
    <Button key="logout-button" variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
};
