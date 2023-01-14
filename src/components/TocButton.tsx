import { Toc } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTocOpen } from "../store/reducers/uiReducer";

const TocButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const tocOpen = useAppSelector((state) => state.ui.tocOpen);
  const onTocToggle = () => dispatch(setTocOpen(!tocOpen));
  const location = useLocation();

  return location.pathname === "/viewer" ? (
    <IconButton
      color="inherit"
      aria-label="menu"
      edge="start"
      onClick={onTocToggle}
      sx={{ mr: 2 }}
      size="small"
    >
      <Toc />
    </IconButton>
  ) : null;
};

export default TocButton;
