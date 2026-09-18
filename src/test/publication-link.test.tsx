import "@testing-library/jest-dom/vitest";
import PublicationLink from "@/components/PublicationLink";
import { Publication } from "@/plugintypes";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { renderWithProviders } from "./renderWithProviders";

afterEach(() => {
  cleanup();
});

const publication: Publication = {
  title: "Moby Dick",
  pluginId: "test-plugin",
  sources: [
    {
      name: "EPUB",
      source: "https://example.com/moby.epub",
      type: "application/epub+zip",
    },
  ],
};

test("links to the publication's page when it has an apiId", async () => {
  renderWithProviders(
    <PublicationLink publication={{ ...publication, apiId: "moby" }} />
  );

  const title = await screen.findByText("Moby Dick");
  expect(title.closest("a")).toHaveAttribute(
    "href",
    expect.stringContaining("/publication/moby")
  );
  expect(screen.queryByText("EPUB")).not.toBeInTheDocument();
});

test("offers the downloads in the row when there is no page to link to", async () => {
  renderWithProviders(<PublicationLink publication={publication} />);

  const title = await screen.findByText("Moby Dick");
  expect(title.closest("a")).toBeNull();
  await waitFor(() =>
    expect(screen.getByText("EPUB").closest("a")).toHaveAttribute(
      "href",
      expect.stringContaining("/viewer")
    )
  );
});
