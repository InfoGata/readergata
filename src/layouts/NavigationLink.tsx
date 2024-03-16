import React from "react";
import { NavLink } from "react-router-dom";
import { NavigationLinkItem } from "../types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <NavLink
      className={({ isActive }) =>
        cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start gap-8 text-md",
          isActive && "bg-muted"
        )
      }
      to={item.link}
      onClick={onClose}
      end
    >
      {item.icon}
      {item.title}
    </NavLink>
  );
};
export default NavigationLink;
