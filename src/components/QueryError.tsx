import { TriangleAlert } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

/**
 * The message of whatever a query rejected with. Plugin calls cross an iframe,
 * and plugin-frame rejects with a plain `{ message }` object rather than an
 * Error, so checking `instanceof Error` alone would lose the plugin's reason.
 */
export const errorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const { message } = error as { message: unknown };
    if (typeof message === "string" && message) return message;
  }
  if (typeof error === "string" && error) return error;
  return undefined;
};

type Props = {
  title: string;
  error: unknown;
  onRetry?: () => void;
};

const QueryError: React.FC<Props> = ({ title, error, onRetry }) => {
  const { t } = useTranslation();
  const message = errorMessage(error);

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-16 text-center"
    >
      <TriangleAlert className="size-10 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{title}</h2>
      {message && (
        <p className="text-muted-foreground text-sm break-all">{message}</p>
      )}
      {onRetry && <Button onClick={onRetry}>{t("tryAgain")}</Button>}
    </div>
  );
};

export default QueryError;
