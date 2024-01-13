import React from "react";
import { Outlet } from "react-router-dom";

const Routing: React.FC = () => {
  return (
    <main className="flex-grow p-1 overflow-auto pt-16">
      <Outlet />
    </main>
  );
};

export default Routing;
