import { Avatar } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export type AboutLinkProps = {
  icon: JSX.Element;
  title: string;
  description?: string;
  url?: string;
  internalPath?: string;
};

const AboutLink: React.FC<AboutLinkProps> = (props) => {
  const { icon, description, title, url, internalPath } = props;
  const CondtionalLink = (props: { children: React.ReactNode }) => {
    if (internalPath) {
      return <Link to={internalPath}>{props.children}</Link>;
    } else {
      return (
        <a href={url} target="_blank">
          {props.children}
        </a>
      );
    }
  };
  return (
    <CondtionalLink>
      <div className="m-1 flex space-x-4 rounded-md py-2 pl-4 pr-16 transition-all hover:bg-accent hover:text-accent-foreground items-center">
        <Avatar>{icon}</Avatar>
        <div className="space-y-1 w-full">
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-sm text-muted-foreground break-words">
            {description}
          </p>
        </div>
      </div>
    </CondtionalLink>
  );
};

export default AboutLink;
