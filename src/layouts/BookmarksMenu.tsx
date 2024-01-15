import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLiveQuery } from "dexie-react-hooks";
import { BookmarkPlusIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBookmarksOpen } from "../store/reducers/uiReducer";
import { getDocumentData } from "../utils";
import BookmarkItem from "./BookmarkItem";

const BookmarksMenu: React.FC = () => {
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );
  const currentLocation = useAppSelector(
    (state) => state.document.currentLocation
  );
  const currentChapter = useAppSelector((state) => state.ui.currentChapter);
  const { t } = useTranslation();
  const open = useAppSelector((state) => state.ui.bookmarksOpen);
  const dispatch = useAppDispatch();
  const setOpen = (open: boolean) => dispatch(setBookmarksOpen(open));

  const documentData = useLiveQuery(() => {
    const data = getDocumentData(currentPublication);
    if (data) {
      return data.first();
    }
  }, [currentPublication]);

  const addBookmark = () => {
    const collection = getDocumentData(currentPublication);
    if (currentLocation && collection) {
      collection.modify((data) => {
        data.bookmarks.push({
          title: currentChapter?.title,
          location: currentLocation,
        });
      });
    }
  };

  const deleteBookmark = (index: number) => {
    const collection = getDocumentData(currentPublication);
    if (collection) {
      collection.modify((data) => {
        data.bookmarks.splice(index, 1);
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="overflow-y-scroll">
        <Button onClick={addBookmark} className="m-2 w-full">
          <BookmarkPlusIcon />
          {t("addBookmark")}
        </Button>
        <div>
          {documentData &&
            documentData.bookmarks.map((b, i) => (
              <BookmarkItem
                key={i}
                bookmark={b}
                index={i}
                deleteBookmark={deleteBookmark}
              />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookmarksMenu;
