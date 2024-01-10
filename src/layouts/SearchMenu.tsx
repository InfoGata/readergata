import { Clear } from "@mui/icons-material";
import { Drawer } from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearSearch,
  setCurrentSearchResult,
  setSearchOpen,
  setSearchQuery,
} from "../store/reducers/uiReducer";
import { drawerWidth } from "../utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchMenu: React.FC = () => {
  const searchOpen = useAppSelector((state) => state.ui.searchOpen);
  const onClose = () => dispatch(setSearchOpen(false));
  const [search, setSearch] = React.useState("");
  const sanitizer = DOMPurify.sanitize;
  const searchResults = useAppSelector((state) => state.ui.searchResults);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (search) {
      dispatch(setSearchQuery(search));
    } else {
      dispatch(clearSearch());
    }
  };

  const resultItems = searchResults.map((r, i) => {
    const onResultClick = () => {
      dispatch(setCurrentSearchResult(r));
    };

    const regex = new RegExp(searchQuery, "i");
    const regExecArray = regex.exec(r.text);
    const originalText = regExecArray ? regExecArray[0] : "";
    const boldText = r.text.replace(regex, `<b>${originalText}</b>`);
    return (
      <button className="w-full" onClick={onResultClick} key={i}>
        <div className="flex py-2 px-4 transition-all hover:bg-accent hover:text-accent-foreground items-center">
          <p dangerouslySetInnerHTML={{ __html: sanitizer(boldText) }} />
        </div>
      </button>
    );
  });

  const onClear = () => {
    setSearch("");
    dispatch(clearSearch());
  };

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={searchOpen}
      onClose={onClose}
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="relative m-2">
          <Input
            placeholder={t("search")}
            className="pr-8"
            value={search}
            onChange={onChange}
            name="query"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 opacity-60"
            onClick={onClear}
          >
            <Clear />
          </Button>
        </div>
      </form>
      <div>{resultItems}</div>
    </Drawer>
  );
};

export default SearchMenu;
