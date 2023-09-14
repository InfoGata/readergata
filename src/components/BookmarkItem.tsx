import React from "react";
import { Bookmark } from "../types";
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useAppDispatch } from "../store/hooks";
import { Delete } from "@mui/icons-material";
import { setCurrentLocation } from "../store/reducers/documentReducer";

interface BookmarkItemProps {
  bookmark: Bookmark;
  index: number;
  deleteBookmark: (index: number) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = (props) => {
  const { bookmark, index, deleteBookmark } = props;
  const dispatch = useAppDispatch();

  const onBookmarkClick = () => {
    dispatch(setCurrentLocation(bookmark.location));
  };

  const onDeleteClick = () => {
    deleteBookmark(index);
  };

  return (
    <ListItem
      disableGutters
      secondaryAction={
        <IconButton onClick={onDeleteClick}>
          <Delete />
        </IconButton>
      }
    >
      <ListItemButton onClick={onBookmarkClick}>
        <ListItemText primary={bookmark.title} secondary={bookmark.location} />
      </ListItemButton>
    </ListItem>
  );
};

export default BookmarkItem;
