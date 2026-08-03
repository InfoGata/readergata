import { formatBytes, formatPublished } from "@/utils";
import { describe, expect, it } from "vitest";

describe("formatBytes", () => {
  it("leaves plain byte counts whole", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
  });

  it("uses decimal units, matching how catalogs report sizes", () => {
    expect(formatBytes(1_000)).toBe("1.0 KB");
    expect(formatBytes(1_200_000)).toBe("1.2 MB");
    expect(formatBytes(2_500_000_000)).toBe("2.5 GB");
  });

  it("drops the decimal once the number is large enough not to need it", () => {
    expect(formatBytes(45_000_000)).toBe("45 MB");
  });

  it("returns nothing for a size that isn't one", () => {
    expect(formatBytes(-1)).toBe("");
    expect(formatBytes(Number.NaN)).toBe("");
  });
});

describe("formatPublished", () => {
  it("leaves a bare year alone", () => {
    // Parsing it as a date would shift it to the previous year for anyone
    // west of UTC.
    expect(formatPublished("1818")).toBe("1818");
    expect(formatPublished(" 1818 ")).toBe("1818");
  });

  it("formats a full date for the reader's locale", () => {
    expect(formatPublished("2019-04-02")).toBe(
      new Date("2019-04-02").toLocaleDateString()
    );
  });

  it("passes through anything it cannot parse", () => {
    expect(formatPublished("sometime in the 1820s")).toBe(
      "sometime in the 1820s"
    );
  });
});
