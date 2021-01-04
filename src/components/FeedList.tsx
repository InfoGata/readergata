import { List, ListItem, ListItemText } from "@material-ui/core";
import React from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { BookLinkItem, BookLinkItemUrl, Catalog } from "../models";
import BookList from "./BookList";
import * as xmldom from "xmldom";
import { OPDS } from "@r2-opds-js/opds/opds1/opds";
import { Entry } from "@r2-opds-js/opds/opds1/opds-entry";
import { XML } from "@r2-utils-js/_utils/xml-js-mapper";
import { Link } from "@r2-opds-js/opds/opds1/opds-link";
import { initGlobalConverters_GENERIC, initGlobalConverters_OPDS } from "@r2-opds-js/opds/init-globals";
initGlobalConverters_GENERIC();
initGlobalConverters_OPDS();

export interface FeedListRouteState {
  url: string;
}

const proxiedUrl = "https://cloudcors.audio-pwa.workers.dev?url=";

const imageRels = [
  //"http://opds-spec.org/image",
  //"http://opds-spec.org/cover",
  "http://opds-spec.org/image/thumbnail",
  "http://opds-spec.org/thumbnail",
];

const linkIsRel = (link: Link, rel: string | ((r: string) => boolean)) => {
  if (!link.HasRel || !link.Rel) return false;
  const rels = link.Rel.split(" ");
  return typeof rel === "function"
    ? rels.some(rel)
    : rels.some((x) => x === rel);
};

const isCatalogEntry = (entry: Entry) => {
  return (
    entry.Links &&
    entry.Links.some((link) =>
      linkIsRel(link, (rel) =>
        rel.startsWith("http://opds-spec.org/acquisition")
      )
    )
  );
};

const isAcquisitionFeed = (feed: OPDS) => {
  return feed.Entries && feed.Entries.some(isCatalogEntry);
};

const getImage = (entry: Entry) => {
  for (const rel of imageRels) {
    const link = entry.Links.find((x) => linkIsRel(x, rel));
    if (link) {
      return link.Href;
    }
  }
  return "";
};

const getAcquisitionUrls = (entry: Entry): BookLinkItemUrl[] => {
  const origin = new URL(entry.Id).origin;
  const acquisitionUrl = "http://opds-spec.org/acquisition";
  return entry.Links
    .filter((l) => l.Rel.startsWith(acquisitionUrl))
    .map((l) => ({
      type: l.Title,
      url: `${origin}${l.Href}`,
    }));
};

const FeedList: React.FC<RouteComponentProps<{}, {}, FeedListRouteState>> = (props)=> {
  const feedUrl = props.location.state.url;
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [books, setBooks] = React.useState<BookLinkItem[]>([]);
  const [isBookFeed, setIsBookFeed] = React.useState(false);
  const [searchUrl, setSearchUrl] = React.useState("");
  const [searchString, setSearchString] = React.useState("");
  const history = useHistory<FeedListRouteState>();

  const makeOpdsRequest = async (url: string) => {
    const response = await fetch(`${proxiedUrl}${url}`);
    const responseString = await response.text();
    const xmlDom = new xmldom.DOMParser().parseFromString(responseString);
    if (!xmlDom || !xmlDom.documentElement) {
      return;
    }
    const isEntry = xmlDom.documentElement.localName === "entry";
    if (isEntry) {
      return;
    }

    let feed = XML.deserialize<OPDS>(xmlDom, OPDS);
    const origin = new URL(feed.Id).origin;
    const search = feed.Links.find((link) => linkIsRel(link, "search"));
    if (search) {
      const absoluteReg = new RegExp('^(?:[a-z]+:)?//', 'i');
      const openSearchUrl = absoluteReg.test(search.Href)
        ? search.Href
        : `${origin}${search.Href}`;
      setSearchUrl(openSearchUrl);
    }
    if (isAcquisitionFeed(feed)) {
      let books: BookLinkItem[] = feed.Entries.map((e) => ({
        name: e.Title,
        authors: e.Authors.map((a) => ({ name: a.Name })),
        icon: `${origin}${getImage(e)}`,
        urls: getAcquisitionUrls(e),
        rights: e.DcRights,
        summary: e.Summary,
        language: e.DcLanguage,
      }));
      setBooks(books);
      setIsBookFeed(true);
    } else {
      setCatalogs(
        feed.Entries.map((e) => ({
          name: e.Title,
          url: e.Id,
        }))
      );
      setIsBookFeed(false);
    }
  };

  React.useEffect(() => {
    makeOpdsRequest(feedUrl);
  }, [feedUrl]);

  const onSearchStringChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
  };

  const onSearchQuery = async () => {
    const searchData = await fetch(searchUrl);
    const searchText = await searchData.text();
    const parser = new DOMParser();
    const openSearchDoc = parser.parseFromString(searchText, "application/xml");
    const urls = openSearchDoc.querySelectorAll("Url");
    const opdsUrl = Array.from(urls).find((url) =>
      url.getAttribute("type")?.includes("application/atom+xml")
    );
    if (!opdsUrl) {
      alert("Failed to search");
      return;
    }

    const template = opdsUrl.getAttribute("template");
    // Exmaple: https://standardebooks.org/ebooks?query={searchTerms}
    const queryUrl = template?.replace("{searchTerms}", searchString);
    if (queryUrl) {
      history.push("/feed", { url: queryUrl });
    }
  };

  const catalogList = catalogs.map((c, i) => {
    const onClick = () => {
      history.push("/feed", { url: c.url });
    }
    return (
      <ListItem key={i} button={true} onClick={onClick}>
        <ListItemText primary={c.name} />
      </ListItem>
    );
  });

  return (
    <div>
      {searchUrl && (
        <div>
          <input value={searchString} onChange={onSearchStringChange} />{" "}
          <button onClick={onSearchQuery}>Search</button>
        </div>
      )}
      {isBookFeed ? <BookList books={books} /> : <List>{catalogList}</List>}
    </div>
  );
};

export default FeedList;
