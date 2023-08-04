import { Box, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { Route, Routes } from "react-router-dom";
import AboutPage from "./AboutPage";
import Donate from "./Donate";
import Home from "./Home";
import Library from "./Library";
import PluginDetails from "./PluginDetails";
import PluginFeed from "./PluginFeed";
import PluginFeedSearch from "./PluginFeedSearch";
import PluginInstall from "./PluginInstall";
import PluginOptions from "./PluginOptions";
import Plugins from "./Plugins";
import Privacy from "./Privacy";
import Settings from "./Settings";
import Viewer from "./Viewer";

const Routing: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 1,
        overflow: "auto",
        minHeight: `calc(100vh - ${theme.spacing(3)})`,
      }}
    >
      <Toolbar />
      <Routes>
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
      </Routes>
    </Box>
  );
};

export default Routing;
