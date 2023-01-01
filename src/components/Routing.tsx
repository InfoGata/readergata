import { Box, Toolbar } from "@mui/material";
import React from "react";
import { Routes, Route } from "react-router-dom";
import PluginFeed from "./PluginFeed";
import PluginOptions from "./PluginOptions";
import Plugins from "./Plugins";
import Viewer from "./Viewer";

const Routing: React.FC = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 1, overflow: "auto" }}>
      <Toolbar />
      <Routes>
        <Route path="/" element={<Viewer />} />
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/plugins/:pluginId/feed/:apiId" element={<PluginFeed />} />
        <Route path="/plugins/:pluginId/feed" element={<PluginFeed />} />
        <Route path="/plugins/:pluginId/options" element={<PluginOptions />} />
      </Routes>
    </Box>
  );
};

export default Routing;
