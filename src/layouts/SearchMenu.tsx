import { Clear } from "@mui/icons-material";
import {
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
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
      <ListItem key={i} disablePadding>
        <ListItemButton onClick={onResultClick}>
          <ListItemText
            primary={
              <Typography
                dangerouslySetInnerHTML={{
                  __html: sanitizer(boldText),
                }}
              />
            }
          />
        </ListItemButton>
      </ListItem>
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
        <TextField
          placeholder={t("search")}
          value={search}
          onChange={onChange}
          name="query"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={onClear}
                  edge="end"
                >
                  {<Clear />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </form>
      <List disablePadding>{resultItems}</List>
    </Drawer>
  );
};

export default SearchMenu;
