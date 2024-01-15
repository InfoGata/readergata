import { Button } from "@/components/ui/button";
import React from "react";
import { FaBookmark } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBookmarksOpen } from "../store/reducers/uiReducer";

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
      <FaBookmark />
    </Button>
  );
};

export default BookmarksButton;
