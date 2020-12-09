import React from "react";
import Parser, { OPDSEntry, OPDSFeed, OPDSLink } from "opds-feed-parser";
import { BookLinkItem, BookLinkItemUrl } from "../models";
import BookLink from "./BookLink";

const defaultCatalogs = [
  {
    name: "Standard Ebooks",
    url: "https://standardebooks.org/opds",
  },
];

const proxiedUrl = "https://cloudcors.audio-pwa.workers.dev?url=";

interface Catalog {
  name: string;
  url: string;
}

interface CatalogItem {
  catalog: Catalog;
}

const imageRels = [
  //"http://opds-spec.org/image",
  //"http://opds-spec.org/cover",
  "http://opds-spec.org/image/thumbnail",
  "http://opds-spec.org/thumbnail",
];

const linkIsRel = (link: OPDSLink, rel: string | ((r: string) => boolean)) => {
  if (!("rel" in link) || !link.rel) return false;
  const rels = link.rel.split(" ");
  return typeof rel === "function"
    ? rels.some(rel)
    : rels.some((x) => x === rel);
};

const isCatalogEntry = (entry: OPDSEntry) => {
  return (
    entry.links &&
    entry.links.some((link) =>
      linkIsRel(link, (rel) =>
        rel.startsWith("http://opds-spec.org/acquisition")
      )
    )
  );
};

const isAcquisitionFeed = (feed: OPDSFeed) => {
  return feed.entries && feed.entries.some(isCatalogEntry);
};

const getImage = (entry: OPDSEntry) => {
  for (const rel of imageRels) {
    const link = entry.links.find((x) => linkIsRel(x, rel));
    if (link) {
      return link.href;
    }
  }
  return "";
};

const getAcquisitionUrls = (entry: OPDSEntry): BookLinkItemUrl[] => {
  const origin = new URL(entry.id).origin;
  const acquisitionUrl = "http://opds-spec.org/acquisition";
  return entry.links
    .filter((l) => l.rel.startsWith(acquisitionUrl))
    .map((l) => ({
      type: l.title,
      url: `${origin}${l.href}`,
    }));
};

const CatalogLink: React.FC<CatalogItem> = (props) => {
  const { catalog } = props;
  const [books, setBooks] = React.useState<BookLinkItem[]>([]);
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [searchUrl, setSearchUrl] = React.useState("");
  const [searchString, setSearchString] = React.useState("");
  const makeOpdsRequest = async (url: string) => {
    const response = await fetch(`${proxiedUrl}${url}`);
    const parser = new Parser();
    const responseString = await response.text();
    const opds = await parser.parse(responseString);
    const feed = opds as OPDSFeed;
    const search = feed.links.find(link => linkIsRel(link, 'search'))
    setSearchUrl(search ? search.href : "");
    if (isAcquisitionFeed(feed)) {
      const origin = new URL(feed.id).origin;
      setBooks(
        feed.entries.map((e) => ({
          name: e.title,
          icon: `${origin}${getImage(e)}`,
          urls: getAcquisitionUrls(e),
        }))
      );
    } else {
      setCatalogs(
        feed.entries.map((e) => ({
          name: e.title,
          url: e.id,
        }))
      );
    }
  }

  const onClick = async () => {
    await makeOpdsRequest(catalog.url);
  };
  const bookItems = books.map((b, i) => <BookLink key={i} bookItem={b} />);
  const catalogLinks = catalogs.map((c, i) => (
    <CatalogLink key={i} catalog={c} />
  ));
  const onSearchStringChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
  };

  const onSearchQuery = async () => {
    const searchData = await fetch(searchUrl);
    const searchText = await searchData.text();
    const parser = new DOMParser();
    const openSearchDoc = parser.parseFromString(searchText, "application/xml");
    const urls = openSearchDoc.querySelectorAll('Url')
    const opdsUrl = Array.from(urls).find(url =>
        url.getAttribute('type')?.includes('application/atom+xml'))
    if (!opdsUrl) {
      alert("Failed to search");
      return;
    } 

    const template = opdsUrl.getAttribute('template')
    // Exmaple: https://standardebooks.org/ebooks?query={searchTerms}
    const queryUrl = template?.replace('{searchTerms}', searchString);
    if (queryUrl) {
      await makeOpdsRequest(queryUrl);
    }
  };
  return (
    <div>
      <div>
        <button onClick={onClick}>{catalog.name}</button>
        {searchUrl && (
          <div>
            <input value={searchString} onChange={onSearchStringChange} />{" "}
            <button onClick={onSearchQuery}>Search</button>
          </div>
        )}
      </div>
      {bookItems}
      {catalogLinks}
    </div>
  );
};

const Opds: React.FC = () => {
  const catalogs = defaultCatalogs.map((c, i) => (
    <CatalogLink key={i} catalog={c} />
  ));
  return <div>{catalogs}</div>;
};

export default Opds;
