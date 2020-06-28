import React from "react";
import { ReactReader } from "react-reader";

const App: React.FC = () => {
  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <ReactReader url={"/alice.epub"} />
    </div>
  );
};

export default App;
