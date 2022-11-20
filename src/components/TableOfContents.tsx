import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { BookContent } from "../models";
import { setLocation } from "../store/reducers/ebookReducer";

interface TocItemProps {
  content: BookContent;
  isNested: boolean;
}

const TocItem: React.FC<TocItemProps> = (props) => {
  const dispatch = useAppDispatch();
  const { content, isNested } = props;
  const onClick = () => {
    if (content.location) {
      dispatch(setLocation(content.location));
    }
  };
  return (
    <ListItem onClick={onClick}>
      <ListItemButton sx={isNested ? { pl: 4 } : undefined}>
        <ListItemText primary={content.title} />
      </ListItemButton>
    </ListItem>
  );
};

const TableOfContents: React.FC = () => {
  const bookContents = useAppSelector((state) => state.ebook.contents);
  const getBookContents = (
    contents: BookContent[],
    isNested = false
  ): JSX.Element[] => {
    if (contents.length === 0) {
      return [];
    }

    return contents.flatMap((c) => [
      <TocItem key={c.title} content={c} isNested={isNested} />,
      ...getBookContents(c.items, true),
    ]);
  };
  return <List>{getBookContents(bookContents)}</List>;
};

export default TableOfContents;
