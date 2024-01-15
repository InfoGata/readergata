import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { DocumentData } from "../../types";
import { FaTrash } from "react-icons/fa6";

interface LibraryBookProps {
  documentData: DocumentData;
  removeDocument: (document: DocumentData) => void;
}

const LibraryBook: React.FC<LibraryBookProps> = (props) => {
  const { documentData, removeDocument } = props;
  const { t } = useTranslation();

  const onRemove = () => {
    removeDocument(documentData);
  };

  return (
    <div>
      <div className="m-1 flex space-x-4 py-2 transition-all hover:bg-accent/50 hover:text-accent-foreground items-center">
        <div className="space-y-1 w-full">
          <p className="text-sm font-medium leading-none">
            {documentData.title ?? documentData.fileName}
          </p>
          <p className="text-sm text-muted-foreground break-words">
            {documentData.author}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted"
              size="icon"
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRemove} className="cursor-pointer">
              <FaTrash />
              <span>{t("remove")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default LibraryBook;
