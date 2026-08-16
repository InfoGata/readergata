import React from "react";
import { useTranslation } from "react-i18next";
import { DownloadProgress as Progress } from "../lib/publication-download";
import { formatBytes } from "../utils";
import { Button } from "./ui/button";

interface DownloadProgressProps {
  progress: Progress;
  onCancel: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = (props) => {
  const { progress, onCancel } = props;
  const { t } = useTranslation();
  const { loaded, total } = progress;
  const percent =
    total && total > 0
      ? Math.min(100, Math.round((loaded / total) * 100))
      : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-background p-6 shadow-lg">
        <div className="space-y-1">
          <p className="font-medium">{t("downloading")}</p>
          <p className="text-sm text-muted-foreground">
            {total
              ? t("downloadedOf", {
                  loaded: formatBytes(loaded),
                  total: formatBytes(total),
                })
              : formatBytes(loaded)}
          </p>
        </div>
        {/* A server that sent no Content-Length leaves nothing to fill. */}
        {percent !== undefined && (
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
};

export default DownloadProgress;
