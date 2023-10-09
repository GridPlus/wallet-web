import "antd/dist/antd.dark.css";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { AddressTagsPage } from "./pages/AddressTagsPage";
import { ConnectPage } from "./pages/ConnectPage";
import { ExplorerPage } from "./pages/ExplorerPage";
import { Landing } from "./pages/LandingPage";
import { PairPage } from "./pages/PairPage";
import { ValidatePage } from "./pages/ValidatePage";
import { WalletPage } from "./pages/WalletPage";
import { AppContextProvider } from "./store/AppContext";
import { BitcoinContextProvider } from "./store/BitcoinContext";
import "./styles.css";
import { PAGE_KEYS } from "./util/constants";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={PAGE_KEYS.ROOT} element={<AuthLayout />}>
        <Route index element={<ConnectPage />} />
        <Route path={PAGE_KEYS.PAIR} element={<PairPage />} />
        <Route path={PAGE_KEYS.VALIDATE} element={<ValidatePage />} />
      </Route>
      <Route path={PAGE_KEYS.MANAGER} element={<AppLayout />}>
        <Route index element={<Landing />} />
        <Route path={PAGE_KEYS.EXPLORER} element={<ExplorerPage />} />
        <Route path={PAGE_KEYS.WALLET} element={<WalletPage />} />
        <Route path={PAGE_KEYS.ADDRESS_TAGS} element={<AddressTagsPage />} />
      </Route>
    </>
  )
);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="lattice-manager-theme">
      <AppContextProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AppContextProvider>
    </ThemeProvider>
  );
}

export default App;
