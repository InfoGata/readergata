import { describe, expect, it } from "vitest";
import { renderChatMarkdown } from "@/components/ChatMarkdown";

describe("renderChatMarkdown", () => {
  it("renders the markdown models reply in", () => {
    const html = renderChatMarkdown(
      "I've opened *The Republic*.\n\n- **Jowett** (1888)\n- `Griffith`"
    );
    expect(html).toContain("<em>The Republic</em>");
    expect(html).toContain("<strong>Jowett</strong>");
    expect(html).toContain("<li>");
    expect(html).toContain("<code>Griffith</code>");
  });

  it("opens links in a new tab so the conversation survives", () => {
    const html = renderChatMarkdown(
      "[Gutenberg](https://www.gutenberg.org/ebooks/1497)"
    );
    const link = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector("a")!;
    expect(link.getAttribute("href")).toBe(
      "https://www.gutenberg.org/ebooks/1497"
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("strips anything active a reply could carry", () => {
    // Replies can quote text from web pages the model fetched.
    const html = renderChatMarkdown(
      '<script>alert(1)</script><img src=x onerror="alert(2)"><a href="javascript:alert(3)">x</a>\n\n[y](javascript:alert(4))'
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("onerror");
    const hrefs = Array.from(
      new DOMParser().parseFromString(html, "text/html").querySelectorAll("a")
    ).map((a) => a.getAttribute("href"));
    expect(hrefs.some((href) => href?.startsWith("javascript:"))).toBe(false);
  });
});
