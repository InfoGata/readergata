import { Drawer } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTocOpen } from "../store/reducers/uiReducer";
import { drawerWidth } from "../utils";
import TableOfContents from "./TableOfContents";

const TocMenu: React.FC = () => {
  const tocOpen = useAppSelector((state) => state.ui.tocOpen);
  const dispatch = useAppDispatch();
  const onClose = () => dispatch(setTocOpen(false));

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={tocOpen}
      onClose={onClose}
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
    >
      <TableOfContents />
    </Drawer>
  );
};

export default TocMenu;
