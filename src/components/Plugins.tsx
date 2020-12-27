import React from "react";
import Opds from "./Opds";
import { useDispatch } from "react-redux";
import { setNavigationOpen } from "../reducers/uiReducer";
import { AppDispatch } from "../store";
import HumbleBundle from "./HumbleBundle";

const Plugins: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    dispatch(setNavigationOpen(false));
  }, [dispatch]);
  return (
    <div>
      <HumbleBundle />
      <Opds />
    </div>
  );
};

export default Plugins;
