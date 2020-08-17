import React from "react";
import { ReactReader } from "react-reader";

const DEMO_URL =
  "https://gerhardsletten.github.io/react-reader/files/alice.epub";
const DEMO_NAME = "Alice in wonderland";

const App: React.FC = () => {
  const [location, setLocation] = React.useState<string | null>(null);
  // const [menuOpen, setMenuOpen] = React.useState(false);

  // React.useEffect(() => {
  //   window.addEventListener("mousemove", (event: MouseEvent) => {
  //     if (event.pageY < 300) {
  //       setMenuOpen(true);
  //     }
  //   });
  // }, []);

  const onLocationChanged = (location: string) => {
    setLocation(location);
  };
  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <div>What</div>
      <ReactReader
        url={DEMO_URL}
        title={DEMO_NAME}
        location={location}
        locationChanged={onLocationChanged}
      />
    </div>
  );
};

export default App;
