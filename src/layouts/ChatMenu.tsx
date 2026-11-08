import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  CheckIcon,
  Loader2Icon,
  SquarePenIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import ChatMarkdown from "../components/ChatMarkdown";
import PublicationSourceButton from "../components/PublicationSourceButton";
import type { ChatItem } from "../contexts/ChatContext";
import usePlugins from "../hooks/usePlugins";
import { useChat } from "../hooks/useChat";
import { PDF_MIME_TYPE, isPdfName } from "../lib/ebook";
import type { ChatRefs } from "../lib/chat/refs";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setChatOpen } from "../store/reducers/uiReducer";

type ToolItem = Extract<ChatItem, { kind: "tool" }>;

interface PluginSearchOutput {
  searchedPlugins: number;
}

const hostOf = (url: unknown) => {
  try {
    return typeof url === "string" ? new URL(url).host : undefined;
  } catch {
    return undefined;
  }
};

const inputField = (input: unknown, key: string): string | undefined => {
  const value =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)[key]
      : undefined;
  return typeof value === "string" ? value : undefined;
};

const useToolLabel = (item: ToolItem): string => {
  const { t } = useTranslation("chat");
  const query = inputField(item.input, "query");
  switch (item.toolName) {
    case "search_plugins": {
      const output = item.output as PluginSearchOutput | undefined;
      return output
        ? t("searchedPlugins", { count: output.searchedPlugins, query })
        : t("searchingPlugins", { query });
    }
    case "get_publication":
      return t("gettingDetails");
    case "open_publication":
    case "open_url": {
      const title =
        inputField(item.input, "title") ?? inputField(item.output, "title");
      return title ? t("opening", { title }) : t("openingBook");
    }
    case "web_search":
    case "google_search":
      return query ? t("searchingWeb", { query }) : t("searchingWebGeneric");
    case "web_fetch":
    case "fetch_page": {
      const host = hostOf(inputField(item.input, "url"));
      return host ? t("readingPage", { host }) : t("readingPageGeneric");
    }
    default:
      return item.toolName;
  }
};

interface ShowOptionsInput {
  refs?: string[];
  links?: { title: string; url: string }[];
}

const OptionCard: React.FC<
  React.PropsWithChildren<{
    title: string;
    authors?: string[];
  }>
> = ({ title, authors, children }) => (
  <li className="rounded-md border p-2">
    <div className="text-sm font-medium text-foreground">{title}</div>
    {authors?.length ? (
      <div className="text-xs text-muted-foreground">{authors.join(", ")}</div>
    ) : null}
    <div className="mt-1 flex flex-wrap gap-1">{children}</div>
  </li>
);

/**
 * The books the model chose to put in front of the user. Only these get
 * cards: showing every search result put unrelated books in the panel.
 */
const ShowOptions: React.FC<{ input: ShowOptionsInput; refs: ChatRefs }> = ({
  input,
  refs,
}) => {
  const { t } = useTranslation("chat");
  const cards = [
    ...(input.refs ?? []).map((id) => {
      const entry = refs.get(id);
      if (!entry) return null;
      if (entry.kind === "source") {
        return (
          <OptionCard key={id} title={entry.title}>
            <PublicationSourceButton
              source={entry.source}
              pluginId={entry.pluginId}
            />
          </OptionCard>
        );
      }
      const { publication, pluginId } = entry;
      return (
        <OptionCard
          key={id}
          title={publication.title}
          authors={publication.authors?.map((a) => a.name)}
        >
          {publication.sources?.length ? (
            publication.sources.map((source, i) => (
              <PublicationSourceButton
                key={i}
                source={source}
                pluginId={pluginId}
              />
            ))
          ) : publication.apiId ? (
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              to="/s/$pluginId/publication/$apiId"
              params={{
                pluginId,
                apiId: encodeURIComponent(publication.apiId),
              }}
              state={{ publication: { ...publication, pluginId } }}
            >
              {t("details")}
            </Link>
          ) : null}
        </OptionCard>
      );
    }),
    ...(input.links ?? []).map((link) => {
      const pdf = isPdfName(link.url);
      return (
        <OptionCard key={link.url} title={link.title}>
          <PublicationSourceButton
            source={{
              source: link.url,
              type: pdf ? PDF_MIME_TYPE : "application/epub+zip",
              // "EPUB · gutenberg.org": the format, and where it comes from.
              name: [
                pdf ? "PDF" : "EPUB",
                hostOf(link.url)?.replace(/^www\./, ""),
              ]
                .filter(Boolean)
                .join(" · "),
            }}
          />
        </OptionCard>
      );
    }),
  ].filter(Boolean);
  if (!cards.length) return null;
  return <ul className="flex flex-col gap-2">{cards}</ul>;
};

const ToolRow: React.FC<{ item: ToolItem; refs: ChatRefs }> = ({
  item,
  refs,
}) => {
  const label = useToolLabel(item);
  const { t } = useTranslation("chat");
  if (item.toolName === "show_options") {
    return <ShowOptions input={item.input as ShowOptionsInput} refs={refs} />;
  }
  return (
    <div className="text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        {item.status === "running" ? (
          <Loader2Icon className="size-3 animate-spin" />
        ) : item.status === "error" ? (
          <AlertCircleIcon className="size-3" aria-label={t("toolFailed")} />
        ) : (
          <CheckIcon className="size-3" />
        )}
        <span>{label}</span>
      </div>
    </div>
  );
};

const ErrorRow: React.FC<{
  item: Extract<ChatItem, { kind: "error" }>;
  provider: string;
}> = ({ item, provider }) => {
  const { t } = useTranslation("chat");
  const text = {
    auth: t("errorAuth", { provider }),
    rateLimit: t("errorRateLimit", { provider }),
    network: t("errorNetwork", { provider }),
    noTools: t("errorNoTools"),
    unknown: t("errorUnknown", { detail: item.detail ?? "" }),
  }[item.error];
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive p-2 text-sm text-destructive"
    >
      {text}
      {item.error === "rateLimit" && item.detail ? (
        <div className="mt-1 text-xs opacity-80">{item.detail}</div>
      ) : null}
    </div>
  );
};

const ChatMessages: React.FC = () => {
  const { items, refs, model, webSearch } = useChat();
  const { t } = useTranslation("chat");
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [items]);

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {webSearch ? t("intro") : t("introPluginsOnly")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        switch (item.kind) {
          case "user":
            return (
              <div
                key={item.id}
                className="self-end max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap"
              >
                {item.text}
              </div>
            );
          case "assistant":
            return (
              <ChatMarkdown
                key={item.id}
                text={item.text}
                className="max-w-[95%] text-sm break-words"
              />
            );
          case "tool":
            return <ToolRow key={item.id} item={item} refs={refs} />;
          case "error":
            return (
              <ErrorRow
                key={item.id}
                item={item}
                provider={model?.providerLabel ?? ""}
              />
            );
        }
      })}
      <div ref={endRef} />
    </div>
  );
};

const ChatSetup: React.FC = () => {
  const { configProblem } = useChat();
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();
  if (!configProblem) return null;
  return (
    <div className="flex flex-col items-start gap-2">
      <h3 className="font-medium">{t("setupTitle")}</h3>
      <p className="text-sm text-muted-foreground">{t(configProblem)}</p>
      <Link
        to="/settings"
        className={buttonVariants({ variant: "outline" })}
        onClick={() => dispatch(setChatOpen(false))}
      >
        {t("openSettings")}
      </Link>
    </div>
  );
};

const ChatInput: React.FC = () => {
  const { send, stop, status, configProblem } = useChat();
  const { pluginsLoaded } = usePlugins();
  const { t } = useTranslation("chat");
  const [text, setText] = React.useState("");
  const streaming = status === "streaming";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    void send(text);
    setText("");
  };

  return (
    <form className="flex gap-2" onSubmit={onSubmit}>
      <Input
        aria-label={t("placeholder")}
        placeholder={pluginsLoaded ? t("placeholder") : t("loadingPlugins")}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!!configProblem}
      />
      {streaming ? (
        <Button type="button" variant="outline" onClick={stop}>
          {t("stop")}
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={!!configProblem || !pluginsLoaded || !text.trim()}
        >
          {t("send")}
        </Button>
      )}
    </form>
  );
};

const ChatMenu: React.FC = () => {
  const chatOpen = useAppSelector((state) => state.ui.chatOpen);
  const dispatch = useAppDispatch();
  const { reset, model, configProblem, items, status } = useChat();
  const { t } = useTranslation("chat");

  return (
    <Sheet open={chatOpen} onOpenChange={(open) => dispatch(setChatOpen(open))}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-3 sm:max-w-md pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="pr-8">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>{t("title")}</SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                disabled={status === "streaming"}
                aria-label={t("newChat")}
                title={t("newChat")}
              >
                <SquarePenIcon />
              </Button>
            )}
          </div>
          <SheetDescription className={cn(!model && "sr-only")}>
            {model ? `${model.providerLabel} · ${model.modelId}` : t("title")}
          </SheetDescription>
        </SheetHeader>
        <div className="grow overflow-y-auto">
          {configProblem ? <ChatSetup /> : <ChatMessages />}
        </div>
        <ChatInput />
      </SheetContent>
    </Sheet>
  );
};

export default ChatMenu;
