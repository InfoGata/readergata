import { Toc } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTocOpen } from "../store/reducers/uiReducer";

const TocButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const tocOpen = useAppSelector((state) => state.ui.tocOpen);
  const onTocToggle = () => dispatch(setTocOpen(!tocOpen));

  return (
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
  );
};

export default TocButton;
