import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVIDERS, supportsNativeSearch } from "@/lib/chat/config";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ChatProviderKind,
  ChatSearchProvider,
  setChatApiKey,
  setChatBaseUrl,
  setChatModel,
  setChatProvider,
  setChatSearch,
} from "@/store/reducers/settingsReducer";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const SEARCH_PROVIDERS: Record<
  ChatSearchProvider,
  { label: string; keyUrl: string }
> = {
  tavily: { label: "Tavily", keyUrl: "https://app.tavily.com" },
  brave: {
    label: "Brave Search",
    keyUrl: "https://api-dashboard.search.brave.com",
  },
};

const NO_SEARCH = "none";

const ChatSetting: React.FC = () => {
  const dispatch = useAppDispatch();
  const chat = useAppSelector((state) => state.settings.chat);
  const { t } = useTranslation(["common", "settings"]);

  const provider: ChatProviderKind = chat?.provider ?? "anthropic";
  const info = PROVIDERS[provider];
  const [apiKey, setApiKey] = React.useState(chat?.apiKeys[provider] ?? "");
  const [model, setModel] = React.useState(chat?.model ?? "");
  const [baseUrl, setBaseUrl] = React.useState(chat?.baseUrl ?? "");
  const [searchProvider, setSearchProvider] = React.useState<string>(
    chat?.searchProvider ?? NO_SEARCH
  );
  const [searchApiKey, setSearchApiKey] = React.useState(
    chat?.searchApiKey ?? ""
  );
  const [useNativeSearch, setUseNativeSearch] = React.useState(
    !chat?.disableNativeSearch
  );

  // The fields belong to whichever provider is selected.
  React.useEffect(() => {
    setApiKey(chat?.apiKeys[provider] ?? "");
    setModel(chat?.model ?? "");
    // Only when the provider changes; typing shouldn't be overwritten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const canSearchNatively = supportsNativeSearch({
    provider,
    model: model || undefined,
  });
  const nativeSearch = canSearchNatively && useNativeSearch;

  const onProviderChange = (value: string) => {
    dispatch(setChatProvider(value as ChatProviderKind));
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setChatApiKey({ provider, apiKey: apiKey.trim() }));
    dispatch(setChatModel(model.trim()));
    dispatch(setChatBaseUrl(baseUrl.trim()));
    dispatch(
      setChatSearch({
        searchProvider:
          searchProvider === NO_SEARCH
            ? undefined
            : (searchProvider as ChatSearchProvider),
        searchApiKey: searchApiKey.trim(),
        disableNativeSearch: !useNativeSearch,
      })
    );
    toast.success(t("settings:chatSaved"));
  };

  const onClearKey = () => {
    setApiKey("");
    dispatch(setChatApiKey({ provider, apiKey: undefined }));
  };

  return (
    <form className="flex w-full max-w-md flex-col gap-3" onSubmit={onSave}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("settings:chatTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings:chatDescription")}
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="chat-provider">{t("settings:chatProvider")}</Label>
        <Select value={provider} onValueChange={onProviderChange}>
          <SelectTrigger id="chat-provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROVIDERS).map(([kind, p]) => (
              <SelectItem key={kind} value={kind}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {provider === "openai-compatible" && (
        <div className="grid gap-2">
          <Label htmlFor="chat-base-url">{t("settings:chatBaseUrl")}</Label>
          <Input
            id="chat-base-url"
            placeholder="https://openrouter.ai/api/v1"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t("settings:chatBaseUrlHint")}
          </p>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="chat-api-key">
          {info.needsApiKey
            ? t("settings:chatApiKey")
            : t("settings:chatApiKeyOptional")}
        </Label>
        <div className="flex gap-2">
          <Input
            id="chat-api-key"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={onClearKey}>
            {t("settings:clear")}
          </Button>
        </div>
        {info.keyUrl && (
          <a
            className="text-xs underline text-muted-foreground"
            href={info.keyUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t("settings:chatGetKey")}
          </a>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="chat-model">{t("settings:chatModel")}</Label>
        <Input
          id="chat-model"
          placeholder={
            info.defaultModel
              ? t("settings:chatModelDefault", { model: info.defaultModel })
              : t("settings:chatModelRequired")
          }
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="chat-search-provider">
          {t("settings:chatSearchTitle")}
        </Label>
        {canSearchNatively && (
          <div className="flex items-center space-x-2">
            <Switch
              id="chat-native-search"
              checked={useNativeSearch}
              onCheckedChange={setUseNativeSearch}
            />
            <Label htmlFor="chat-native-search" className="font-normal">
              {t("settings:chatUseNativeSearch", { provider: info.label })}
            </Label>
          </div>
        )}
        {nativeSearch ? (
          <p className="text-sm text-muted-foreground">
            {t("settings:chatSearchNative", { provider: info.label })}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t("settings:chatSearchFallback")}
            </p>
            <Select value={searchProvider} onValueChange={setSearchProvider}>
              <SelectTrigger id="chat-search-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SEARCH}>
                  {t("settings:chatSearchNone")}
                </SelectItem>
                {Object.entries(SEARCH_PROVIDERS).map(([kind, p]) => (
                  <SelectItem key={kind} value={kind}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {searchProvider !== NO_SEARCH && (
              <>
                <Label htmlFor="chat-search-key">
                  {t("settings:chatSearchKey")}
                </Label>
                <Input
                  id="chat-search-key"
                  type="password"
                  autoComplete="off"
                  value={searchApiKey}
                  onChange={(e) => setSearchApiKey(e.target.value)}
                />
                <a
                  className="text-xs underline text-muted-foreground"
                  href={
                    SEARCH_PROVIDERS[searchProvider as ChatSearchProvider]
                      .keyUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("settings:chatGetKey")}
                </a>
              </>
            )}
          </>
        )}
      </div>
      <div>
        <Button type="submit">{t("common:save")}</Button>
      </div>
    </form>
  );
};

export default ChatSetting;
