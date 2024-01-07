import { PreloadedState } from "@reduxjs/toolkit";
import { RenderOptions, render } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { AppState, AppStore, setupStore } from "../store/store";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<AppState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren): JSX.Element {
    const options = { element: children, path: "/" };

    const router = createMemoryRouter([{ ...options }], {
      initialEntries: [options.path],
      initialIndex: 1,
    });
    return (
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
