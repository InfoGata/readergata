import { Button } from "@/components/ui/button";
import React from "react";
import { useAppDispatch } from "../store/hooks";
import { setCurrentLocation } from "../store/reducers/documentReducer";
import { Bookmark } from "../types";
import { FaTrash } from "react-icons/fa6";

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
    <div className="flex py-2 transition-all hover:bg-accent/50 hover:text-accent-foreground">
      <button className="w-full" onClick={onBookmarkClick}>
        <p>{bookmark.title}</p>
        <p className="text-sm text-muted-foreground">{bookmark.location}</p>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-muted"
        onClick={onDeleteClick}
      >
        <FaTrash />
      </Button>
    </div>
  );
};

export default BookmarkItem;
