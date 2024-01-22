import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "./ui/avatar";

export type AboutLinkProps = {
  icon?: JSX.Element;
  avatarSrc?: string;
  title: string;
  description?: string;
  url?: string;
  internalPath?: string;
  onClick?: () => void;
};

const AboutLink: React.FC<AboutLinkProps> = (props) => {
  const { icon, description, title, url, internalPath, onClick, avatarSrc } =
    props;
  const CondtionalLink = (props: { children: React.ReactNode }) => {
    if (internalPath) {
      return <Link to={internalPath}>{props.children}</Link>;
    } else {
      if (url) {
        return (
          <a href={url} target="_blank">
            {props.children}
          </a>
        );
      } else {
        if (onClick) {
          return (
            <button className="w-full" onClick={onClick}>
              {props.children}
            </button>
          );
        } else {
          return <>{props.children}</>;
        }
      }
    }
  };
  return (
    <CondtionalLink>
      <div className="m-1 flex space-x-4 rounded-md py-2 pl-4 pr-16 transition-all hover:bg-accent hover:text-accent-foreground items-center">
        {icon && (
          <div className="w-10 h-10 flex items-center bg-muted-foreground rounded-full justify-center text-background">
            {icon}
          </div>
        )}
        {avatarSrc && (
          <Avatar className="rounded-none">
            <AvatarImage src={avatarSrc} />
          </Avatar>
        )}
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
