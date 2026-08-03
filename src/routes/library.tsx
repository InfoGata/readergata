import { Link, createFileRoute } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filterAsync } from "@infogata/utils";
import { CompassIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import LibraryBooks from "../components/Library/LibraryBooks";
import OpenFileButton from "../components/OpenFileButton";
import { PluginFrameContainer } from "../contexts/PluginsContext";
import usePlugins from "../hooks/usePlugins";

const Library: React.FC = () => {
  const { plugins } = usePlugins();
  const { t } = useTranslation(["library", "common"]);
  const [feedPlugins, setFeedPlugins] = React.useState<PluginFrameContainer[]>(
    []
  );

  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(plugins, async (p) =>
        p.hasDefined.onGetFeed()
      );
      setFeedPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("common:library")}</h1>
        <div className="w-full sm:w-auto">
          <OpenFileButton />
        </div>
      </div>
      {feedPlugins.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("browseSources")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {feedPlugins.map((p) => (
              <Link
                key={p.id}
                className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                to="/s/$pluginId/feed"
                params={{ pluginId: p.id || "" }}
              >
                <CompassIcon className="size-4" />
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <LibraryBooks />
    </div>
  );
};

export const Route = createFileRoute("/library")({
  component: Library,
});
