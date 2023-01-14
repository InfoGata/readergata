import { Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSearchOpen } from "../store/reducers/uiReducer";

const SearchButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchOpen = useAppSelector((state) => state.ui.searchOpen);
  const onSearchToggle = () => dispatch(setSearchOpen(!searchOpen));
  const location = useLocation();

  return location.pathname === "/viewer" ? (
    <IconButton
      color="inherit"
      aria-label="menu"
      edge="start"
      sx={{ mr: 2 }}
      size="small"
      onClick={onSearchToggle}
    >
      <Search />
    </IconButton>
  ) : null;
};

export default SearchButton;
