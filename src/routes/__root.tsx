import { Outlet, createRootRoute } from "@tanstack/react-router";
import React from "react";
import { Toaster } from "../components/ui/sonner";
import useFullScreen from "../hooks/useFullScreen";
import useOffline from "../hooks/useOffline";
import useUpdateServiceWorker from "../hooks/useUpdateServiceWorker";
import { ChatProvider } from "../contexts/ChatContext";
import BookmarksMenu from "../layouts/BookmarksMenu";
import ChatMenu from "../layouts/ChatMenu";
import NavigationMenu from "../layouts/NavigationMenu";
import SearchMenu from "../layouts/SearchMenu";
import TocMenu from "../layouts/TocMenu";
import TopBar from "../layouts/TopBar";

export const Root: React.FC = () => {
  useFullScreen();
  useUpdateServiceWorker();
  useOffline();

  // ChatProvider sits above the outlet so a conversation survives the
  // navigation to /viewer that opening a book causes.
  return (
    <ChatProvider>
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
        <ChatMenu />
      </div>
    </ChatProvider>
  );
};

export const Route = createRootRoute({
  component: Root,
});
