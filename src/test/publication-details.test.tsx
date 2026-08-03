import "@testing-library/jest-dom/vitest";
import PublicationDetails from "@/components/PublicationDetails";
import { Publication } from "@/plugintypes";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";

afterEach(() => {
  cleanup();
});

/**
 * No plugin is installed in these tests, so `onGetPublicationDetails` is never
 * reached and the page renders from the feed row alone — which is also what
 * happens in the app for any plugin that doesn't implement the method.
 */
const render = (publication: Publication) =>
  renderWithProviders(
    <PublicationDetails
      pluginId="test-plugin"
      apiId="test-id"
      publicationFromFeed={publication}
    />
  );

const full: Publication = {
  title: "Frankenstein",
  subtitle: "Or, The Modern Prometheus",
  apiId: "test-id",
  pluginId: "test-plugin",
  summary: "<p>A scientist and his creature.</p>",
  authors: [{ name: "Mary Shelley" }, { name: "Percy Shelley" }],
  publisher: "Lackington, Hughes, Harding, Mavor & Jones",
  languages: ["en", "fr"],
  published: "1818",
  categories: [{ name: "Horror" }, { name: "Gothic", scheme: "bisac" }],
  series: { name: "Gothic Classics", position: 3 },
  pageCount: 280,
  rights: "Public domain",
  identifiers: [{ type: "isbn", value: "9780486282114" }],
  rating: 4.5,
  sources: [
    {
      name: "EPUB",
      source: "https://example.com/frankenstein.epub",
      type: "application/epub+zip",
      size: 1_200_000,
    },
  ],
  originalUrl: "https://example.com/frankenstein",
};

test("renders every field the publication has", async () => {
  render(full);

  await waitFor(() =>
    expect(screen.getByText("Frankenstein")).toBeInTheDocument()
  );

  expect(screen.getByText("Or, The Modern Prometheus")).toBeInTheDocument();
  expect(screen.getByText("A scientist and his creature.")).toBeInTheDocument();
  expect(screen.getByText("Mary Shelley, Percy Shelley")).toBeInTheDocument();
  expect(screen.getByText(full.publisher!)).toBeInTheDocument();
  expect(screen.getByText("1818")).toBeInTheDocument();
  expect(screen.getByText("Gothic Classics (#3)")).toBeInTheDocument();
  expect(screen.getByText("en, fr")).toBeInTheDocument();
  expect(screen.getByText("Horror, Gothic")).toBeInTheDocument();
  expect(screen.getByText("280")).toBeInTheDocument();
  expect(screen.getByText("4.5 out of 5")).toBeInTheDocument();
  expect(screen.getByText("ISBN 9780486282114")).toBeInTheDocument();
  expect(screen.getByText("Public domain")).toBeInTheDocument();

  // The source button carries what it costs and how big it is.
  expect(screen.getByText("EPUB")).toBeInTheDocument();
  expect(screen.getByText("1.2 MB")).toBeInTheDocument();
  expect(
    screen.getByText(i18next.t("common:originalUrl"))
  ).toBeInTheDocument();
});

test("renders a publication with nothing but a title", async () => {
  render({ title: "Untitled Fragment" });

  await waitFor(() =>
    expect(screen.getByText("Untitled Fragment")).toBeInTheDocument()
  );

  // Every optional field is dropped rather than rendered as an empty row.
  for (const label of [
    i18next.t("common:authors"),
    i18next.t("common:publisher"),
    i18next.t("common:published"),
    i18next.t("common:series"),
    i18next.t("common:languages"),
    i18next.t("common:categories"),
    i18next.t("common:pageCount"),
    i18next.t("common:rating"),
    i18next.t("common:identifiers"),
    i18next.t("common:rights"),
    i18next.t("common:summary"),
  ]) {
    expect(screen.queryByText(label)).not.toBeInTheDocument();
  }
});

test("says so when there is no publication to show", async () => {
  renderWithProviders(
    <PublicationDetails pluginId="test-plugin" apiId="missing" />
  );

  await waitFor(() =>
    expect(
      screen.getByText(i18next.t("common:publicationNotFound"))
    ).toBeInTheDocument()
  );
});
