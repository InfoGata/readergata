import React from "react";
import { NavigationLinkItem } from "../types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface NavigationLinkProps {
  item: NavigationLinkItem;
  setOpen: (open: boolean) => void;
}

const NavigationLink: React.FC<NavigationLinkProps> = (props) => {
  const { item, setOpen } = props;
  const onClose = () => {
    setOpen(false);
  };
  return (
    <Link
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full justify-start gap-8 text-md"
      )}
      activeProps={{ className: "bg-muted" }}
      to={item.link}
      onClick={onClose}
    >
      {item.icon}
      {item.title}
    </Link>
  );
};
export default NavigationLink;
