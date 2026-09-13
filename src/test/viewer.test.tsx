import "@testing-library/jest-dom/vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";
import { Route } from "@/routes/viewer";

// Reached through the route rather than exported: autoCodeSplitting can only
// move a route component into its own chunk when nothing else imports it.
const Viewer = Route.options.component!;

describe("Viewer", () => {
  afterEach(() => {
    cleanup();
  });

  test("Should render properly", async () => {
    renderWithProviders(<Viewer />);
    expect(screen).toBeDefined();
    await waitFor(() =>
      expect(
        screen.queryByText(i18next.t("common:openFile"))
      ).toBeInTheDocument()
    );
  });
});
