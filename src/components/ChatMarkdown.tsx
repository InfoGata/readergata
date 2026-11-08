import createDOMPurify from "dompurify";
import { Marked } from "marked";
import React from "react";

const marked = new Marked({ gfm: true, breaks: true });

// Its own instance, so the hook below doesn't touch the sanitizer the rest of
// the app uses for plugin html.
const purify = createDOMPurify(window);
purify.addHook("afterSanitizeAttributes", (node) => {
  // Links in a reply point off-site (a book's page, a source); leaving the
  // app for them would lose the conversation.
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export const renderChatMarkdown = (text: string): string =>
  purify.sanitize(marked.parse(text, { async: false }), {
    // A model's reply is never meant to embed media or forms.
    FORBID_TAGS: ["img", "video", "audio", "iframe", "form", "input", "style"],
  });

/**
 * A model reply. Rendered as markdown since every provider answers in it; it
 * is re-parsed as the reply streams in, which is cheap at chat lengths.
 */
const ChatMarkdown: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const html = React.useMemo(() => renderChatMarkdown(text), [text]);
  return (
    <div
      className={`chat-markdown ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default ChatMarkdown;
