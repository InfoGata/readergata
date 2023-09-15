import { Button, Drawer, List } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setBookmarksOpen } from "../store/reducers/uiReducer";
import { drawerWidth, getDocumentData } from "../utils";
import { useTranslation } from "react-i18next";
import { BookmarkAdd } from "@mui/icons-material";
import { useLiveQuery } from "dexie-react-hooks";
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
  const onClose = () => dispatch(setBookmarksOpen(false));

  const documentData = useLiveQuery(() => {
    const data = getDocumentData(currentPublication);
    if (data) {
      return data.first();
    }
  }, [currentPublication]);

  const addBookmark = () => {
    let collection = getDocumentData(currentPublication);
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
    let collection = getDocumentData(currentPublication);
    if (collection) {
      collection.modify((data) => {
        data.bookmarks.splice(index, 1);
      });
    }
  };

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
    >
      <Button
        variant="contained"
        startIcon={<BookmarkAdd />}
        onClick={addBookmark}
      >
        {t("addBookmark")}
      </Button>
      <List>
        {documentData &&
          documentData.bookmarks.map((b, i) => (
            <BookmarkItem
              key={i}
              bookmark={b}
              index={i}
              deleteBookmark={deleteBookmark}
            />
          ))}
      </List>
    </Drawer>
  );
};

export default BookmarksMenu;
