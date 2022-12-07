import { Box, Toolbar } from "@mui/material";
import React from "react";
import { Routes, Route } from "react-router-dom";
import EbookViewer from "./EbookViewer";
import FeedList from "./FeedList";
import PluginFeed from "./PluginFeed";
import Plugins from "./Plugins";

const Routing: React.FC = () => {
  return (
    <Box component="main">
      <Toolbar />
      <Routes>
        <Route path="/" element={<EbookViewer />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/feed" element={<FeedList />} />
        <Route path="/plugins/:pluginId/feed/:apiId" element={<PluginFeed />} />
        <Route path="/plugins/:pluginId/feed" element={<PluginFeed />} />
      </Routes>
    </Box>
  );
};

export default Routing;
