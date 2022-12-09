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

  return (
    <Button
      component={Link}
      to={{
        pathname: "/viewer",
        search: `?source=${encodeURIComponent(source.source)}`,
      }}
    >
      {source.name ?? source.type}
    </Button>
  );
};

export default PublicationSourceButton;
