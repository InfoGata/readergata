import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaBookOpen,
  FaCircleInfo,
  FaCompress,
  FaExpand,
  FaGear,
  FaHouse,
  FaPuzzlePiece,
} from "react-icons/fa6";
import { MdLibraryBooks } from "react-icons/md";
import OpenFileButton from "../components/OpenFileButton";
import OpenUrlForm from "../components/OpenUrlForm";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setIsFullscreen,
  setNavigationOpen,
} from "../store/reducers/uiReducer";
import { NavigationLinkItem } from "../types";
import NavigationLink from "./NavigationLink";

const NavigationMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const setOpen = (value: boolean) => dispatch(setNavigationOpen(value));
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const { t } = useTranslation();

  const listItems: NavigationLinkItem[] = [
    { title: t("home"), link: { to: "/" }, icon: <FaHouse /> },
    {
      title: t("reader"),
      link: { to: "/viewer" },
      icon: <FaBookOpen />,
    },
    { title: t("plugins"), link: { to: "/plugins" }, icon: <FaPuzzlePiece /> },
    { title: t("library"), link: { to: "/library" }, icon: <MdLibraryBooks /> },
    { title: t("settings"), link: { to: "/settings" }, icon: <FaGear /> },
    { title: t("about"), link: { to: "/about" }, icon: <FaCircleInfo /> },
  ];

  return (
    <Sheet open={navigationOpen} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-64 p-2 overflow-y-scroll" aria-describedby={undefined}>
        <SheetTitle className="sr-only">{t("navigation")}</SheetTitle>
        <div className="space-y-2 py-4 text-muted-foreground">
          {listItems.map((l) => (
            <NavigationLink key={l.title} item={l} setOpen={setOpen} />
          ))}
        </div>
        <div className="flex flex-col justify-center items-center">
          <div>
            <OpenFileButton />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(setIsFullscreen(!isFullscreen))}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </Button>
          <div>
            <OpenUrlForm />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationMenu;
