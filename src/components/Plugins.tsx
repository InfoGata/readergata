import React from "react";
import Opds from "./Opds";
import { setNavigationOpen } from "../store/reducers/uiReducer";
import HumbleBundle from "./HumbleBundle";
import { Typography } from "@mui/material";
import { useAppDispatch } from "../store/hooks";

const Plugins: React.FC = () => {
  const dispatch = useAppDispatch();

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
