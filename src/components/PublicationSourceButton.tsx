import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { PublicationSource } from "../plugintypes";

interface PublicationSourceButtonProps {
  source: PublicationSource;
}

const PublicationSourceButton: React.FC<PublicationSourceButtonProps> = (
  props
) => {
  const { source } = props;
  let search = `?source=${encodeURIComponent(source.source)}`;
  search = source.type ? `${search}&type=${source.type}` : search;

  return (
    <Button
      component={Link}
      to={{
        pathname: "/viewer",
        search: search,
      }}
    >
      {source.name ?? source.type}
    </Button>
  );
};

export default PublicationSourceButton;
