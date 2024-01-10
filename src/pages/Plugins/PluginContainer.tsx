import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PluginFrameContainer } from "../../PluginsContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Delete, MoreHoriz } from "@mui/icons-material";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface PluginContainerProps {
  plugin: PluginFrameContainer;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
}

const PluginContainer: React.FC<PluginContainerProps> = (props) => {
  const { plugin, deletePlugin } = props;
  const { t } = useTranslation("plugins");

  const onDelete = async () => {
    const confirmDelete = window.confirm(t("confirmDelete"));
    if (confirmDelete) {
      await deletePlugin(plugin);
    }
  };

  return (
    <div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {plugin.name} {plugin.version}
        </h3>
        <div className="flex gap-2 items-center">
          {plugin.hasOptions && (
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "uppercase"
              )}
              to={`/plugins/${plugin.id}/options`}
            >
              {t("options")}
            </Link>
          )}
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "uppercase")}
            to={`/plugins/${plugin.id}`}
          >
            {t("pluginDetails")}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="data-[state=open]:bg-muted"
              >
                <MoreHoriz />
                <span className="sr-only">{t("openMenu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={onDelete}>
                <Delete />
                <span className="uppercase">{t("deletePlugin")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default PluginContainer;
