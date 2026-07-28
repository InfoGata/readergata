import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import isElectron from "is-electron";
import React from "react";
import Spinner from "./components/Spinner";
import usePlugins from "./hooks/usePlugins";
import { routeTree } from "./routeTree.gen";

const history = isElectron() ? createHashHistory() : createBrowserHistory();
const router = createRouter({
  routeTree,
  history,
  defaultPendingComponent: Spinner,
});
export type RouterType = typeof router;

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const Router: React.FC = () => {
  const { pluginsLoaded } = usePlugins();

  // The alias registry that params.parse reads is populated as plugins are
  // published, and TanStack only ever parses a given url once — so rendering
  // before that would permanently mis-parse an alias deep link.
  if (!pluginsLoaded) {
    return <Spinner />;
  }

  return <RouterProvider router={router} />
}

export default Router;