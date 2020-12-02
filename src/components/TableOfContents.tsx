import { List, ListItem, ListItemText, makeStyles, createStyles, Theme } from "@material-ui/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookContent } from "../models";
import { setLocation } from "../reducers/ebookReducer";
import { RootState } from "../rootReducer";
import { AppDispatch } from "../store";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(3),
    },
  })
);

interface TocItemProps {
  content: BookContent;
  isNested: boolean;
}

const TocItem: React.FC<TocItemProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const classes = useStyles();
  const { content, isNested } = props;
  const onClick = () => {
    if (content.location) {
      dispatch(setLocation(content.location));
    }
  };
  return (
    <ListItem button={true} onClick={onClick} className={isNested ? classes.nested : ""}>
      <ListItemText primary={content.title} />
    </ListItem>
  );
};

const TableOfContents: React.FC = () => {
  const bookContents = useSelector((state: RootState) => state.ebook.contents);
  const getBookContents = (
    contents: BookContent[],
    isNested = false
  ): JSX.Element[] => {
    if (contents.length === 0) {
      return [];
    }

    return contents.flatMap((c) => [
      <TocItem
        key={c.title}
        content={c}
        isNested={isNested}
      />,
      ...getBookContents(c.items, true),
    ]);
  };
return <List>{getBookContents(bookContents)}</List>;
}

export default TableOfContents;
