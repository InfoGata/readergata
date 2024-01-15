import { Button } from "@/components/ui/button";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSearchOpen } from "../store/reducers/uiReducer";
import { FaMagnifyingGlass } from "react-icons/fa6";

const SearchButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchOpen = useAppSelector((state) => state.ui.searchOpen);
  const onSearchToggle = () => dispatch(setSearchOpen(!searchOpen));

  return (
    <Button size="icon" variant="ghost" onClick={onSearchToggle}>
      <FaMagnifyingGlass />
    </Button>
  );
};

export default SearchButton;
