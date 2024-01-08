import React from "react";
import { DocumentData } from "../../types";
import { MoreHoriz } from "@mui/icons-material";
import { Button } from "@/components/ui/button";

interface LibraryBookProps {
  documentData: DocumentData;
  openMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    documentData: DocumentData
  ) => void;
}

const LibraryBook: React.FC<LibraryBookProps> = (props) => {
  const { documentData, openMenu } = props;

  const openDocumentMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, documentData);
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
        <Button variant="ghost" onClick={openDocumentMenu}>
          <MoreHoriz />
        </Button>
      </div>
    </div>
  );
};

export default LibraryBook;
