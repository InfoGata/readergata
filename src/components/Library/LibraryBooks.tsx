import OpenFileButton from "@/components/OpenFileButton";
import { Input } from "@/components/ui/input";
import { compareDocuments, matchesSearch } from "@/lib/library";
import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { LibraryBigIcon, SearchIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { db } from "../../database";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearPublication } from "../../store/reducers/documentReducer";
import { clearBookData } from "../../store/reducers/uiReducer";
import { DocumentData } from "../../types";
import { getDocumentData } from "../../utils";
import LibraryBook from "./LibraryBook";

/** Above this a list is long enough that scanning it beats filtering it. */
const SEARCH_THRESHOLD = 6;

const LibraryBooks: React.FC = () => {
  const documents = useLiveQuery(() => db.documentData.toArray());
  const dispatch = useAppDispatch();
  const { t } = useTranslation("library");
  const [search, setSearch] = React.useState("");
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );
  const currentDocument = useLiveQuery(() => {
    const data = getDocumentData(currentPublication);
    if (data) {
      return data.first();
    }
  }, [currentPublication]);

  const onRemove = async (document: DocumentData) => {
    if (document.id) {
      if (currentDocument?.id === document.id) {
        dispatch(clearPublication());
        dispatch(clearBookData());
      }
      await db.documentData.delete(document.id);
    }
  };

  const sorted = React.useMemo(
    () => [...(documents ?? [])].sort(compareDocuments),
    [documents]
  );
  const visible = React.useMemo(
    () => sorted.filter((d) => matchesSearch(d, search)),
    [sorted, search]
  );

  if (!documents) return null;

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
        <LibraryBigIcon className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </div>
        <div className="flex w-full max-w-56 flex-col items-center gap-2">
          <OpenFileButton />
          <Link
            to="/plugins"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {t("browsePlugins")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {search.trim()
            ? t("filteredCount", {
                count: visible.length,
                total: documents.length,
              })
            : t("documentCount", { count: documents.length })}
        </h2>
        {documents.length >= SEARCH_THRESHOLD && (
          <div className="relative w-full sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              type="search"
              value={search}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("noResults", { query: search })}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((d) => (
            <LibraryBook
              key={d.id ?? d.url ?? d.xxhash64}
              documentData={d}
              removeDocument={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryBooks;
