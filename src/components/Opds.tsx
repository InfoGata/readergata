import React from "react";
import { useNavigate } from "react-router-dom";
import { Catalog } from "../plugintypes";

export const defaultCatalogs: Catalog[] = [
  {
    name: "Project Gutenberg",
    url: "https://m.gutenberg.org/ebooks.opds/",
  },
];

interface CatalogLinkProps {
  catalog: Catalog;
}

const CatalogLink: React.FC<CatalogLinkProps> = (props) => {
  const { catalog } = props;
  const navigate = useNavigate();

  const onClick = async () => {
    navigate("/feed", { state: { url: catalog.url } });
  };
  return <button onClick={onClick}>{catalog.name}</button>;
};

const Opds: React.FC = () => {
  const catalogs = defaultCatalogs;

  const catalogLinks = catalogs.map((c, i) => (
    <CatalogLink key={i} catalog={c} />
  ));
  return <div>{catalogLinks}</div>;
};

export default Opds;
