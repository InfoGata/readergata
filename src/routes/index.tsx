import DragFileContainer from "@/components/DragFileContainer";
import { ExtensionBanner } from "@/components/ExtensionBanner";
import OpenFileButton from "@/components/OpenFileButton";
import PluginCards from "@/components/PluginCards/PluginCards";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Index: React.FC = () => {
  return (
    <DragFileContainer>
      <ExtensionBanner />
      <OpenFileButton />
      <PluginCards />
    </DragFileContainer>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
});
