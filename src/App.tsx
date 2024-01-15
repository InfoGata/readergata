import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import { Toaster } from "./components/ui/sonner";
import useFullScreen from "./hooks/useFullScreen";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import BookmarksMenu from "./layouts/BookmarksMenu";
import MainContainer from "./layouts/MainContainer";
import NavigationMenu from "./layouts/NavigationMenu";
import SearchMenu from "./layouts/SearchMenu";
import TocMenu from "./layouts/TocMenu";
import TopBar from "./layouts/TopBar";
import PluginsProvider from "./providers/PluginsProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  useFullScreen();
  useUpdateServiceWorker();
  useOffline();

  return (
    <QueryClientProvider client={queryClient}>
      <MatomoRouterProvider>
        <PluginsProvider>
          <div className="flex h-screen">
            <Toaster closeButton />
            <TopBar />
            <NavigationMenu />
            <MainContainer />
            <TocMenu />
            <SearchMenu />
            <BookmarksMenu />
          </div>
        </PluginsProvider>
      </MatomoRouterProvider>
    </QueryClientProvider>
  );
};

export default App;
