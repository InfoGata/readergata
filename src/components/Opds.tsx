import React from "react";
import Parser, { OPDSEntry, OPDSFeed, OPDSLink } from "opds-feed-parser";
import { BookLinkItem, BookLinkItemUrl } from "../models";
import BookLink from "./BookLink";

const standardEbooks = 'https://standardebooks.org/opds';
const proxiedUrl = 'https://cloudcors.audio-pwa.workers.dev?url=';

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

const linkIsRel = (link: OPDSLink, rel: string) => {
  if (!('rel' in link) || !link.rel) return false
  const rels = link.rel.split(' ')
  return typeof rel === 'function'
      ? rels.some(rel)
      : rels.some(x => x === rel)
}


const getImage = (entry: OPDSEntry) => {
  for (const rel of imageRels) {
    const link = entry.links.find(x => linkIsRel(x, rel));
    if (link) {
      return link.href;
    }
  }
  return "";
};

const getAcquisitionUrls = (entry: OPDSEntry): BookLinkItemUrl[]  => {
  const origin = new URL(entry.id).origin;
  const acquisitionUrl = "http://opds-spec.org/acquisition";
  return entry.links
    .filter((l) => l.rel.startsWith(acquisitionUrl))
    .map((l) => ({
      type: l.title,
      url: `${origin}${l.href}`
    }));
};

const CatalogLink: React.FC<CatalogItem> = (props) => {
  const {catalog} = props;
  const [books, setBooks] = React.useState<BookLinkItem[]>([]);
  const onClick = async () => {
    const response = await fetch(`${proxiedUrl}${catalog.url}`);
    const parser = new Parser();
    const responseString = await response.text();
    const opds = await parser.parse(responseString);
    const feed = opds as OPDSFeed;
    console.log(feed);
    const origin = new URL(feed.id).origin;
    setBooks(feed.entries.map(e => ({
      name: e.title,
      icon: `${origin}${getImage(e)}`,
      urls: getAcquisitionUrls(e)
    })));
  };
  const bookItems = books.map((b, i) => 
    <BookLink key={i} bookItem={b} />
  );
  return (
    <div>
      <div>
        <button onClick={onClick}>{catalog.name}</button>
      </div>
      {bookItems}
    </div>
  );
};

const Opds: React.FC = () => {
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([])
  const onClick = async () => {
    const response = await fetch(`${proxiedUrl}${standardEbooks}`);
    const parser = new Parser();
    const responseString = await response.text();
    const opds = await parser.parse(responseString);
    const feed = opds as OPDSFeed;
    console.log(feed);
    setCatalogs(feed.entries.map(e => ({
      name: e.title,
      url: e.id
    })));
  };
  const catalogLinks = catalogs.map((c, i) => 
    <CatalogLink key={i} catalog={c} />
    );
  return <div>
      <button onClick={onClick}>Open Standard Ebooks</button>
      {catalogLinks}
    </div>;
};

export default Opds;