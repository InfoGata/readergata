import {
  Avatar,
  Dialog,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React from "react";
import { BookLinkItem }  from "../models";
import BookInfo from "./BookInfo";


interface BookLinkProps {
  bookItem: BookLinkItem;
}

const BookLink: React.FC<BookLinkProps> = (props) => {
  const { bookItem } = props;
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const toggleDialogOpen = () => {
    setDialogOpen(!dialogOpen);
  }

  return (
    <>
      <ListItem button={true} onClick={toggleDialogOpen}>
        <ListItemAvatar>
          <Avatar src={bookItem.icon} variant="square" />
        </ListItemAvatar>
        <ListItemText
          primary={bookItem.name}
          secondary={bookItem.authors?.map((a) => a.name).join(", ")}
        />
      </ListItem>
      <Dialog open={dialogOpen} onClose={toggleDialogOpen}>
        <BookInfo book={bookItem} />
      </Dialog>
    </>
  );
}

export default BookLink;
