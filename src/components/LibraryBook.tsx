import React from "react";
import { DocumentData } from "../types";
import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";

interface LibraryBookProps {
  documentData: DocumentData;
  openMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    documentData: DocumentData
  ) => void;
}

const LibraryBook: React.FC<LibraryBookProps> = (props) => {
  const { documentData, openMenu } = props;

  const openDocumentMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, documentData);
  };

  return (
    <ListItem>
      <ListItemText
        primary={documentData.title ?? documentData.fileName}
        secondary={documentData.author}
      />
      <ListItemSecondaryAction>
        <IconButton onClick={openDocumentMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default LibraryBook;
