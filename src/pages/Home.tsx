import React from "react";
import DragFileContainer from "../components/DragFileContainer";
import OpenFileButton from "../components/OpenFileButton";
import PluginCards from "../components/PluginCards/PluginCards";

const Home: React.FC = () => {
  return (
    <DragFileContainer>
      <OpenFileButton />
      <PluginCards />
    </DragFileContainer>
  );
};

export default Home;
