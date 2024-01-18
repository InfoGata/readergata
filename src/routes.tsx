import {
  Route,
  Routes,
  createBrowserRouter,
  createHashRouter,
} from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import Donate from "./pages/Donate";
import Home from "./pages/Home";
import Library from "./pages/Library/Library";
import PluginDetails from "./pages/PluginDetails";
import PluginFeed from "./pages/PluginFeed";
import PluginFeedSearch from "./pages/PluginFeedSearch";
import PluginInstall from "./pages/PluginInstall";
import PluginOptions from "./pages/PluginOptions";
import Plugins from "./pages/Plugins/Plugins";
import Privacy from "./pages/Privacy";
import Settings from "./pages/Settings/Settings";
import Viewer from "./pages/Viewer";
import isElectron from "is-electron";
import App from "./App";

const Root = () => {
  return (
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/plugininstall" element={<PluginInstall />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/donate" element={<Donate />} />
        <Route
          path="/plugins/:pluginId/feed/search"
          element={<PluginFeedSearch />}
        />
        <Route path="/plugins/:pluginId/feed/:apiId" element={<PluginFeed />} />
        <Route path="/plugins/:pluginId/feed" element={<PluginFeed />} />
        <Route path="/plugins/:pluginId" element={<PluginDetails />} />
        <Route path="/plugins/:pluginId/options" element={<PluginOptions />} />
      </Route>
    </Routes>
  );
};

const createRouter = isElectron() ? createHashRouter : createBrowserRouter;
const router = createRouter([{ path: "*", Component: Root }]);

export default router;
