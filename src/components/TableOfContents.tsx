import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setContent } from "../store/reducers/uiReducer";
import { BookContent } from "../types";

interface TocItemProps {
  content: BookContent;
  isNested: boolean;
  currentChapter?: BookContent;
}

const TocItem: React.FC<TocItemProps> = (props) => {
  const dispatch = useAppDispatch();
  const { content, isNested, currentChapter } = props;
  const onClick = () => {
    if (content) {
      dispatch(setContent(content));
    }
  };
  let title = content.title;
  if (content.pageNumber) {
    title += `- ${content.pageNumber}`;
  }
  let selected =
    !!currentChapter?.location && currentChapter.location === content.location;
  selected ||=
    !!currentChapter?.pageNumber &&
    currentChapter.pageNumber === content.pageNumber;
  return (
    <ListItem onClick={onClick}>
      <ListItemButton sx={isNested ? { pl: 4 } : undefined} selected={selected}>
        <ListItemText primary={title} />
      </ListItemButton>
    </ListItem>
  );
};

const TableOfContents: React.FC = () => {
  const bookContents = useAppSelector((state) => state.ui.contents);
  const currentChapter = useAppSelector((state) => state.ui.currentChapter);
  const getBookContents = (
    contents: BookContent[],
    isNested = false
  ): JSX.Element[] => {
    if (contents.length === 0) {
      return [];
    }

    return contents.flatMap((c) => [
      <TocItem
        key={`${c.title}-${c.pageNumber}`}
        content={c}
        isNested={isNested}
        currentChapter={currentChapter}
      />,
      ...getBookContents(c.items, true),
    ]);
  };
  return <List>{getBookContents(bookContents)}</List>;
};

export default TableOfContents;
