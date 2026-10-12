import { Outlet, createRootRoute } from "@tanstack/react-router";
import React from "react";
import { Toaster } from "../components/ui/sonner";
import useFullScreen from "../hooks/useFullScreen";
import useOffline from "../hooks/useOffline";
import useUpdateServiceWorker from "../hooks/useUpdateServiceWorker";
import BookmarksMenu from "../layouts/BookmarksMenu";
import NavigationMenu from "../layouts/NavigationMenu";
import SearchMenu from "../layouts/SearchMenu";
import TocMenu from "../layouts/TocMenu";
import TopBar from "../layouts/TopBar";

export const Root: React.FC = () => {
  useFullScreen();
  useUpdateServiceWorker();
  useOffline();

  return (
    <div className="flex h-screen">
      <Toaster closeButton />
      <TopBar />
      <NavigationMenu />
      <main className="grow p-1 overflow-auto pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <TocMenu />
      <SearchMenu />
      <BookmarksMenu />
    </div>
  );
};

export const Route = createRootRoute({
  component: Root,
});
