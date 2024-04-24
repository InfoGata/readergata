import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "../components/ui/sonner";
import useFullScreen from "../hooks/useFullScreen";
import useOffline from "../hooks/useOffline";
import useUpdateServiceWorker from "../hooks/useUpdateServiceWorker";
import BookmarksMenu from "../layouts/BookmarksMenu";
import NavigationMenu from "../layouts/NavigationMenu";
import SearchMenu from "../layouts/SearchMenu";
import TocMenu from "../layouts/TocMenu";
import TopBar from "../layouts/TopBar";
import PluginsProvider from "../providers/PluginsProvider";
import { Outlet, createRootRoute } from "@tanstack/react-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const Root: React.FC = () => {
  useFullScreen();
  useUpdateServiceWorker();
  useOffline();

  return (
    <QueryClientProvider client={queryClient}>
      <PluginsProvider>
        <div className="flex h-screen">
          <Toaster closeButton />
          <TopBar />
          <NavigationMenu />
          <main className="flex-grow p-1 overflow-auto pt-16">
            <Outlet />
          </main>
          <TocMenu />
          <SearchMenu />
          <BookmarksMenu />
        </div>
      </PluginsProvider>
    </QueryClientProvider>
  );
};

export const Route = createRootRoute({
  component: Root,
});
