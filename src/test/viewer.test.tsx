import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";
import { Viewer } from "@/routes/viewer";

describe("Viewer", () => {
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
