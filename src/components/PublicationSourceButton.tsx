import React from "react";
import { Link } from "react-router-dom";
import { PublicationSource } from "../plugintypes";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

interface PublicationSourceButtonProps {
  source: PublicationSource;
  pluginId?: string;
}

const PublicationSourceButton: React.FC<PublicationSourceButtonProps> = (
  props
) => {
  const { source, pluginId } = props;
  let search = `?source=${encodeURIComponent(source.source)}`;
  search = source.type ? `${search}&type=${source.type}` : search;
  search = pluginId ? `${search}&pluginId=${pluginId}` : search;

  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "uppercase")}
      to={{
        pathname: "/viewer",
        search: search,
      }}
    >
      {source.name ?? source.type}
    </Link>
  );
};

export default PublicationSourceButton;
