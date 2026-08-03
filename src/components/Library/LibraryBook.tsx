import Alert from "@/components/Alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FILE_INPUT_ACCEPT } from "@/lib/ebook";
import {
  formatFileSize,
  getDocumentFormat,
  getDocumentHost,
  getDocumentTitle,
  isPdfDocument,
} from "@/lib/library";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BookOpenText,
  BookmarkIcon,
  FileTextIcon,
  FolderSearchIcon,
  ImagesIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa6";
import useOpenDocument from "../../hooks/useOpenDocument";
import { DocumentData } from "../../types";

interface LibraryBookProps {
  documentData: DocumentData;
  removeDocument: (document: DocumentData) => void;
}

const kindIcons = {
  pdf: FileTextIcon,
  comic: ImagesIcon,
  ebook: BookOpenText,
};

const Badge: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs text-muted-foreground",
      className
    )}
  >
    {children}
  </span>
);

const LibraryBook: React.FC<LibraryBookProps> = (props) => {
  const { documentData, removeDocument } = props;
  const { t } = useTranslation(["library", "common"]);
  const openDocument = useOpenDocument();
  const [alertOpen, setAlertOpen] = React.useState(false);

  const format = getDocumentFormat(documentData);
  const Icon = kindIcons[format?.kind ?? "ebook"];
  const title = getDocumentTitle(documentData) || t("untitled");
  const subtitle = documentData.author || getDocumentHost(documentData);
  const size = formatFileSize(documentData.fileSize);
  const bookmarkCount = documentData.bookmarks?.length ?? 0;

  // Only the reading position is stored for a file opened from disk, so such an
  // entry can't be reopened by itself -- picking the file again finds it by
  // hash and resumes where it left off.
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) openDocument(file);
  };

  const cardClassName =
    "flex h-full gap-3 rounded-lg border bg-card p-3 pr-10 text-left transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const contents = (
    <>
      <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{title}</p>
        {subtitle && (
          <p className="line-clamp-1 break-all text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {format && <Badge>{format.label}</Badge>}
          {documentData.currentLocation && (
            <Badge className="border-primary/40 text-primary">
              {t("inProgress")}
            </Badge>
          )}
          {bookmarkCount > 0 && (
            <Badge>
              <BookmarkIcon className="size-3" />
              {bookmarkCount}
            </Badge>
          )}
          {size && <Badge>{size}</Badge>}
          {!documentData.url && (
            <Badge>
              <FolderSearchIcon className="size-3" />
              {t("locateFile")}
            </Badge>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="group relative">
      {documentData.url ? (
        <Link
          className={cardClassName}
          to="/viewer"
          search={{
            source: encodeURIComponent(documentData.url),
            type: isPdfDocument(documentData) ? "application/pdf" : undefined,
          }}
        >
          {contents}
        </Link>
      ) : (
        <label
          className={cn(cardClassName, "cursor-pointer")}
          title={t("locateFileHint")}
        >
          {contents}
          <span className="sr-only">{t("locateFileHint")}</span>
          <input
            type="file"
            hidden
            accept={FILE_INPUT_ACCEPT}
            onChange={onFileChange}
          />
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="absolute right-1 top-1 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
            aria-label={t("bookActions", { title })}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setAlertOpen(true)}
            className="cursor-pointer"
          >
            <FaTrash />
            <span>{t("common:remove")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Alert
        title={t("confirmRemoveTitle")}
        description={t("confirmRemoveDescription", { title })}
        open={alertOpen}
        setOpen={setAlertOpen}
        confirm={() => removeDocument(documentData)}
      />
    </div>
  );
};

export default LibraryBook;
