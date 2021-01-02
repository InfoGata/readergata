import React from "react";
import Opds from "./Opds";
import { useDispatch } from "react-redux";
import { setNavigationOpen } from "../reducers/uiReducer";
import { AppDispatch } from "../store";
import HumbleBundle from "./HumbleBundle";
import { Typography } from "@material-ui/core";

const Plugins: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    dispatch(setNavigationOpen(false));
  }, [dispatch]);
  return (
    <div>
      <Typography variant="h3">Plugins</Typography>
      <HumbleBundle />
      <Typography variant="h3">Opds</Typography>
      <Opds />
    </div>
  );
};

export default Plugins;
