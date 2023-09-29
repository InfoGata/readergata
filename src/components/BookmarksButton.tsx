import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBookmarksOpen } from "../store/reducers/uiReducer";
import { IconButton } from "@mui/material";
import { Bookmarks } from "@mui/icons-material";

const BookmarksButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookmarksOpen = useAppSelector((state) => state.ui.bookmarksOpen);
  const onBookmarksToggle = () => dispatch(setBookmarksOpen(!bookmarksOpen));

  return (
    <IconButton
      color="inherit"
      aria-label="bookmarks"
      edge="start"
      sx={{ mr: 2 }}
      size="small"
      onClick={onBookmarksToggle}
    >
      <Bookmarks />
    </IconButton>
  );
};

export default BookmarksButton;
