import { Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSearchOpen } from "../store/reducers/uiReducer";

const SearchButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchOpen = useAppSelector((state) => state.ui.searchOpen);
  const onSearchToggle = () => dispatch(setSearchOpen(!searchOpen));

  return (
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
  );
};

export default SearchButton;
