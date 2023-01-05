import { Search } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setCurrentSearchResult,
  setSearchQuery,
} from "../store/reducers/uiReducer";
import DOMPurify from "dompurify";
import { useLocation } from "react-router-dom";

const SearchBook: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const sanitizer = DOMPurify.sanitize;
  const searchResults = useAppSelector((state) => state.ui.searchResults);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };

  const handleSubmit = (event: React.FormEvent<{}>) => {
    event.preventDefault();
    dispatch(setSearchQuery(search));
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

  return location.pathname === "/viewer" ? (
    <>
      <IconButton
        color="inherit"
        aria-label="menu"
        edge="start"
        sx={{ mr: 2 }}
        size="small"
        onClick={handleClick}
      >
        <Search />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            placeholder={t("search")}
            value={search}
            onChange={onChange}
            name="query"
          />
        </form>
        <List disablePadding>{resultItems}</List>
      </Popover>
    </>
  ) : null;
};

export default SearchBook;
