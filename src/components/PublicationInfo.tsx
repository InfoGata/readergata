import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Dialog,
  Typography,
  ListItemButton,
} from "@mui/material";
import React from "react";
import { Publication } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import PublicationSourceButton from "./PublicationSourceButton";

interface PublicationInfoProps {
  publication: Publication;
}

const PublicationInfo: React.FC<PublicationInfoProps> = (props) => {
  const { publication } = props;
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const toggleDialogOpen = () => {
    setDialogOpen(!dialogOpen);
  };

  const icon = getThumbnailImage(publication?.images, searchThumbnailSize);
  const authors = publication.authors?.map((a) => a.name).join(", ");

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton onClick={toggleDialogOpen}>
          <ListItemAvatar>
            <Avatar src={icon} variant="square" />
          </ListItemAvatar>
          <ListItemText
            primary={publication.title}
            secondary={publication.authors?.map((a) => a.name).join(", ")}
          />
        </ListItemButton>
      </ListItem>
      <Dialog open={dialogOpen} onClose={toggleDialogOpen}>
        <img alt="cover" src={icon} />
        <Typography variant="h3">{publication.title}</Typography>
        <Typography variant="h5">{authors}</Typography>
        <Typography variant="body1">{publication.summary}</Typography>
        {publication.sources?.map((s, i) => (
          <PublicationSourceButton
            key={i}
            source={s}
            pluginId={publication.pluginId}
          />
        ))}
      </Dialog>
    </>
  );
};

export default PublicationInfo;
