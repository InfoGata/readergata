import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setNavigationOpen } from "../store/reducers/uiReducer";
import BookmarksButton from "./BookmarksButton";
import SearchButton from "./SearchButton";
import Title from "./Title";
import TocButton from "./TocButton";

const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationOpen = useAppSelector((state) => state.ui.navigationOpen);
  const onNavigationToggle = () => dispatch(setNavigationOpen(!navigationOpen));
  const location = useLocation();

  return (
    <header className="fixed top-0 left-auto right-0 w-full shadow-lg z-40 bg-background border-b">
      <div className="flex items-center px-6 min-h-12">
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onNavigationToggle}>
            <MenuIcon />
          </Button>
          {location.pathname === "/viewer" ? (
            <>
              <Title />
              <div className="flex">
                <SearchButton />
                <BookmarksButton />
                <TocButton />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
