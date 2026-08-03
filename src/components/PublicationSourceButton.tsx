import React from "react";
import { useTranslation } from "react-i18next";
import { AcquisitionType, PublicationSource } from "../plugintypes";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { formatBytes } from "../utils";

interface PublicationSourceButtonProps {
  source: PublicationSource;
  pluginId?: string;
}

const acquisitionKeys = {
  "open-access": "acquisitionOpenAccess",
  borrow: "acquisitionBorrow",
  buy: "acquisitionBuy",
  sample: "acquisitionSample",
  subscribe: "acquisitionSubscribe",
} as const satisfies Record<AcquisitionType, string>;

const PublicationSourceButton: React.FC<PublicationSourceButtonProps> = (
  props
) => {
  const { source, pluginId } = props;
  const { t } = useTranslation();

  const price =
    source.price !== undefined && source.currency
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: source.currency,
        }).format(source.price)
      : undefined;

  // What it costs, what it is and how big it is — only the parts the plugin
  // actually knew.
  const detail = [
    source.acquisitionType && t(acquisitionKeys[source.acquisitionType]),
    price,
    source.size !== undefined ? formatBytes(source.size) : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "h-auto flex-col")}
      to="/viewer"
      search={{
        pluginId: pluginId,
        source: encodeURIComponent(source.source),
        type: source.type,
      }}
    >
      <span>{source.name ?? source.type}</span>
      {detail && (
        <span className="text-xs font-normal text-muted-foreground">
          {detail}
        </span>
      )}
    </Link>
  );
};

export default PublicationSourceButton;
