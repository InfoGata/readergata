import React from "react";
import { PublicationSource } from "../plugintypes";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface PublicationSourceButtonProps {
  source: PublicationSource;
  pluginId?: string;
}

const PublicationSourceButton: React.FC<PublicationSourceButtonProps> = (
  props
) => {
  const { source, pluginId } = props;

  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }))}
      to="/viewer"
      search={{
        pluginId: pluginId,
        source: encodeURIComponent(source.source),
        type: source.type,
      }}
    >
      {source.name ?? source.type}
    </Link>
  );
};

export default PublicationSourceButton;
