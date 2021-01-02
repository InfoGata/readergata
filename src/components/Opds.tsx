import React from "react";
import { Catalog } from "../models";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../rootReducer";
import { FeedListRouteState } from "./FeedList";

interface CatalogLinkProps {
  catalog: Catalog;
}

const CatalogLink: React.FC<CatalogLinkProps> = (props) => {
  const { catalog } = props;
  const history = useHistory<FeedListRouteState>();

  const onClick = async () => {
    history.push("/feed", { url: catalog.url });
  };
  return <button onClick={onClick}>{catalog.name}</button>;
};

const Opds: React.FC = () => {
  const catalogs = useSelector((state: RootState) => state.catalog.catalogs);

  const catalogLinks = catalogs.map((c, i) => (
    <CatalogLink key={i} catalog={c} />
  ));
  return <div>{catalogLinks}</div>;
};

export default Opds;
