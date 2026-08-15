import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { ExternalLink } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePlugins from "@/hooks/usePlugins";
import { findPluginByParam } from "@/lib/plugin-route";
import { cn } from "@/lib/utils";
import { Publication } from "../plugintypes";
import { formatPublished, searchThumbnailSize } from "../utils";
import AboutLink, { AboutLinkProps } from "./AboutLink";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import PublicationSourceButton from "./PublicationSourceButton";
import Spinner from "./Spinner";
import { buttonVariants } from "./ui/button";
import { getThumbnailImage } from "@infogata/utils";

interface PublicationDetailsProps {
  pluginId: string;
  apiId: string;
  /** The feed row the reader came from, when they came from one. */
  publicationFromFeed?: Publication;
}

const PublicationDetails: React.FC<PublicationDetailsProps> = (props) => {
  const { pluginId, apiId, publicationFromFeed } = props;
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = findPluginByParam(plugins, pluginId);
  const { t } = useTranslation();
  const sanitizer = DOMPurify.sanitize;

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const getDetails = async () => {
    if (!plugin) return null;
    // Null rather than undefined: react-query rejects undefined, and "this
    // plugin has nothing more to say" is a real answer, not a missing one.
    if (!(await plugin.hasDefined.onGetPublicationDetails())) return null;
    return await plugin.remote.onGetPublicationDetails({ apiId });
  };

  const detailsQuery = useQuery({
    queryKey: ["publicationDetails", pluginId, apiId],
    queryFn: getDetails,
    enabled: pluginsLoaded && !!plugin,
  });

  // The feed row shows immediately and is all a plugin without
  // onGetPublicationDetails will ever give us. The fetched copy replaces it
  // whole rather than merging field by field: the plugin's own answer is the
  // authority on every field, including the ones it chose to leave empty.
  const publication = detailsQuery.data ?? publicationFromFeed;
  const loading = detailsQuery.isLoading || isLoading;

  if (!publication) {
    return (
      <>
        <Spinner open={loading} />
        {!loading && <p>{t("publicationNotFound")}</p>}
        <ConfirmPluginDialog
          open={Boolean(pendingPlugin)}
          plugins={pendingPlugin ? [pendingPlugin] : []}
          handleClose={removePendingPlugin}
        />
      </>
    );
  }

  const icon = getThumbnailImage(publication.images, searchThumbnailSize);
  const authors = publication.authors?.map((a) => a.name).join(", ");

  const aboutLinks: (AboutLinkProps | null)[] = [
    authors ? { title: t("authors"), description: authors } : null,
    publication.publisher
      ? { title: t("publisher"), description: publication.publisher }
      : null,
    publication.published
      ? {
          title: t("published"),
          description: formatPublished(publication.published),
        }
      : null,
    publication.series
      ? {
          title: t("series"),
          description:
            publication.series.position === undefined
              ? publication.series.name
              : t("seriesPosition", {
                  name: publication.series.name,
                  position: publication.series.position,
                }),
        }
      : null,
    publication.languages?.length
      ? { title: t("languages"), description: publication.languages.join(", ") }
      : null,
    publication.categories?.length
      ? {
          title: t("categories"),
          description: publication.categories.map((c) => c.name).join(", "),
        }
      : null,
    publication.pageCount !== undefined
      ? {
          title: t("pageCount"),
          description: publication.pageCount.toLocaleString(),
        }
      : null,
    publication.rating !== undefined
      ? {
          title: t("rating"),
          description: t("ratingValue", { rating: publication.rating }),
        }
      : null,
    publication.identifiers?.length
      ? {
          title: t("identifiers"),
          description: publication.identifiers
            .map((i) => `${i.type.toUpperCase()} ${i.value}`)
            .join(", "),
        }
      : null,
    publication.rights
      ? { title: t("rights"), description: publication.rights }
      : null,
  ];

  return (
    <>
      <Spinner open={loading} />
      <div className="mx-auto max-w-3xl space-y-4 p-3">
        <div className="flex flex-col items-center gap-2">
          {icon && <img alt="" src={icon} height={225} width={125} />}
          <h1 className="text-3xl font-bold text-center">
            {publication.title}
          </h1>
          {publication.subtitle && (
            <h2 className="text-lg font-semibold text-center text-muted-foreground">
              {publication.subtitle}
            </h2>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {publication.sources?.map((s, i) => (
            <PublicationSourceButton
              key={i}
              source={s}
              pluginId={publication.pluginId ?? plugin?.id}
            />
          ))}
          {publication.originalUrl && (
            <a
              href={publication.originalUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ExternalLink className="size-4" />
              {t("originalUrl")}
            </a>
          )}
        </div>
        {publication.summary && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none">{t("summary")}</h3>
            {/* Summaries arrive as html from most catalogs, so this one field
                can't go through AboutLink's plain-text description. */}
            <div
              className="text-sm text-muted-foreground wrap-break-word"
              dangerouslySetInnerHTML={{
                __html: sanitizer(publication.summary),
              }}
            />
          </div>
        )}
        <div>
          {aboutLinks.map((a) => a && <AboutLink {...a} key={a.title} />)}
        </div>
      </div>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default PublicationDetails;
