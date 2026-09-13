import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";

const optIn = vi.fn();
const optOut = vi.fn();

// The component's whole job is talking to this client, so it's the seam.
vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({
    opt_in_capturing: optIn,
    opt_out_capturing: optOut,
  }),
}));

import AnalyticsPreference from "@/components/AnalyticsPreference";
import store from "@/store/store";
import { setDisableAnalytics } from "@/store/reducers/settingsReducer";

const setDnt = (value: string | null) =>
  vi.stubGlobal("navigator", { ...navigator, doNotTrack: value });

beforeEach(() => {
  optIn.mockClear();
  optOut.mockClear();
  setDnt(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
  store.dispatch(setDisableAnalytics(false));
});

const renderPreference = () =>
  render(
    <Provider store={store}>
      <AnalyticsPreference />
    </Provider>
  );

describe("AnalyticsPreference", () => {
  it("opts in without capturing an event for having done so", () => {
    renderPreference();

    // The default captures an $opt_in event, which would be a capture nobody
    // asked for on every load.
    expect(optIn).toHaveBeenCalledWith({ captureEventName: false });
    expect(optOut).not.toHaveBeenCalled();
  });

  it("opts out when the reader turned it off", () => {
    store.dispatch(setDisableAnalytics(true));
    renderPreference();

    expect(optOut).toHaveBeenCalled();
    expect(optIn).not.toHaveBeenCalled();
  });

  it("opts out under Do Not Track even with the setting on", () => {
    setDnt("1");
    renderPreference();

    expect(optOut).toHaveBeenCalled();
    expect(optIn).not.toHaveBeenCalled();
  });

  it("follows the preference when it changes", () => {
    renderPreference();
    optOut.mockClear();

    React.act(() => {
      store.dispatch(setDisableAnalytics(true));
    });

    expect(optOut).toHaveBeenCalled();
  });
});
