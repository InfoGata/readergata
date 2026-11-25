import "@testing-library/jest-dom/vitest";
import "../i18n";
import PluginFeed from "@/components/PluginFeed";
import { errorMessage } from "@/components/QueryError";
import PluginsContext from "@/contexts/PluginsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// plugin-frame rejects with a serialized object, not an Error.
const pluginError = { message: "Failed to load https://example.com/: HTTP 503" };

const renderFeed = (onGetFeed: () => Promise<unknown>) => {
  const plugin = {
    id: "test-plugin",
    name: "Test",
    hasDefined: { onGetFeed: async () => true },
    remote: { onGetFeed },
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PluginsContext.Provider
        value={{ plugins: [plugin], pluginsLoaded: true } as any}
      >
        <PluginFeed pluginId="test-plugin" onOffsetChange={() => {}} />
      </PluginsContext.Provider>
    </QueryClientProvider>
  );
};

test("shows the plugin's error when the feed fails to load", async () => {
  const onGetFeed = vi.fn().mockRejectedValue(pluginError);
  renderFeed(onGetFeed);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Couldn't load this feed"
  );
  expect(screen.getByText(pluginError.message)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await vi.waitFor(() => expect(onGetFeed).toHaveBeenCalledTimes(2));
});

test("errorMessage reads Errors, serialized errors and strings", () => {
  expect(errorMessage(new Error("boom"))).toBe("boom");
  expect(errorMessage({ message: "remote" })).toBe("remote");
  expect(errorMessage("plain")).toBe("plain");
  expect(errorMessage({})).toBeUndefined();
  expect(errorMessage(undefined)).toBeUndefined();
});
