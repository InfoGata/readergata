import { Box, Toolbar } from "@mui/material";
import React from "react";
import { Routes, Route } from "react-router-dom";
import EbookViewer from "./EbookViewer";
import PluginFeed from "./PluginFeed";
import PluginOptions from "./PluginOptions";
import Plugins from "./Plugins";

const Routing: React.FC = () => {
  return (
    <Box component="main">
      <Toolbar />
      <Routes>
        <Route path="/" element={<EbookViewer />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/plugins/:pluginId/feed/:apiId" element={<PluginFeed />} />
        <Route path="/plugins/:pluginId/feed" element={<PluginFeed />} />
        <Route path="/plugins/:pluginId/options" element={<PluginOptions />} />
      </Routes>
    </Box>
  );
};

export default Routing;
