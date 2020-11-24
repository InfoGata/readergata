import { List, ListItem, ListItemText, makeStyles, createStyles, Theme } from "@material-ui/core";
import React from "react";
import { BookContent } from "../models";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(3),
    },
  })
);

interface TocItemProps {
  content: BookContent;
  setLocation: (location: string) => void;
  isNested: boolean;
}

const TocItem: React.FC<TocItemProps> = (props) => {
  const classes = useStyles();
  const { content, isNested, setLocation } = props;
  const onClick = () => {
    if (content.location) {
      setLocation(content.location);
    }
  };
  return (
    <ListItem button={true} onClick={onClick} className={isNested ? classes.nested : ""}>
      <ListItemText primary={content.title} />
    </ListItem>
  );
};

interface Props  {
  bookContents: BookContent[];
  setLocation: (location: string) => void;
}

const TableOfContents: React.FC<Props> = (props) => {
  const { bookContents, setLocation } = props;

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
        setLocation={setLocation}
        isNested={isNested}
      />,
      ...getBookContents(c.items, true),
    ]);
  };
return <List>{getBookContents(bookContents)}</List>;
}

export default TableOfContents;
