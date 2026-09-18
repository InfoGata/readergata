import React from "react";
import { Publication } from "../plugintypes";
import { searchThumbnailSize } from "../utils";
import AboutLink from "./AboutLink";
import PublicationSourceButton from "./PublicationSourceButton";
import { getThumbnailImage } from "@infogata/utils";

interface PublicationLinkProps {
  publication: Publication;
}

/**
 * A publication as it appears in a feed.
 *
 * Clicking through goes to the publication's own url rather than opening a
 * dialog, so the page can be shared and the back button returns the reader to
 * this feed, on this page of it.
 *
 * The whole row travels along in history state: the plugin has already told us
 * the title, cover and authors, so the page has something to show immediately
 * instead of a spinner.
 */
const PublicationLink: React.FC<PublicationLinkProps> = (props) => {
  const { publication } = props;
  const icon = getThumbnailImage(publication.images, searchThumbnailSize);
  const description = publication.authors?.map((a) => a.name).join(", ");

  // Without an apiId there is no url to point at, and a plugin that sets no
  // pluginId hasn't come through onGetFeed. Either way the row can't lead to a
  // page, so it offers the downloads itself — otherwise a catalog whose
  // entries don't link to themselves would list books nobody can open.
  if (!publication.apiId || !publication.pluginId) {
    return (
      <div>
        <AboutLink
          title={publication.title}
          description={description}
          avatarSrc={icon}
        />
        {!!publication.sources?.length && (
          <div className="flex flex-wrap gap-2 pb-2 pl-4">
            {publication.sources.map((s, i) => (
              <PublicationSourceButton
                key={i}
                source={s}
                pluginId={publication.pluginId}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <AboutLink
      title={publication.title}
      description={description}
      avatarSrc={icon}
      link={{
        to: "/s/$pluginId/publication/$apiId",
        params: {
          pluginId: publication.pluginId,
          apiId: encodeURIComponent(publication.apiId),
        },
        state: { publication },
      }}
    />
  );
};

export default PublicationLink;
