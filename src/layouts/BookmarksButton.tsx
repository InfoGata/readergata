import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBookmarksOpen } from "../store/reducers/uiReducer";
import { Bookmarks } from "@mui/icons-material";
import { Button } from "@/components/ui/button";

const BookmarksButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookmarksOpen = useAppSelector((state) => state.ui.bookmarksOpen);
  const onBookmarksToggle = () => dispatch(setBookmarksOpen(!bookmarksOpen));

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onBookmarksToggle}
      aria-label="contents"
    >
      <Bookmarks />
    </Button>
  );
};

export default BookmarksButton;
