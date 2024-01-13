import { Search } from "@mui/icons-material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSearchOpen } from "../store/reducers/uiReducer";
import { Button } from "@/components/ui/button";

const SearchButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchOpen = useAppSelector((state) => state.ui.searchOpen);
  const onSearchToggle = () => dispatch(setSearchOpen(!searchOpen));

  return (
    <Button size="icon" variant="ghost" onClick={onSearchToggle}>
      <Search />
    </Button>
  );
};

export default SearchButton;
