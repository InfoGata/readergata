import { Delete } from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { db } from "../../database";
import { DocumentData } from "../../types";
import LibraryBook from "./LibraryBook";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getDocumentData } from "../../utils";
import { clearPublication } from "../../store/reducers/documentReducer";
import { clearBookData } from "../../store/reducers/uiReducer";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";

const LibraryBooks: React.FC = () => {
  const documents = useLiveQuery(() => db.documentData.toArray());
  const dispatch = useAppDispatch();
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );
  const currentDocument = useLiveQuery(() => {
    const data = getDocumentData(currentPublication);
    if (data) {
      return data.first();
    }
  }, [currentPublication]);

  const { t } = useTranslation();
  const [menuDocument, setMenuDocument] = React.useState<DocumentData>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const onRemove = async () => {
    if (menuDocument?.id) {
      if (currentDocument?.id === menuDocument.id) {
        dispatch(clearPublication());
        dispatch(clearBookData());
      }
      await db.documentData.delete(menuDocument.id);
    }
  };

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    documentData: DocumentData
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuDocument(documentData);
  };
  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <div>
        {documents?.map((d) => (
          <LibraryBook
            key={d.url || d.xxhash64}
            documentData={d}
            openMenu={openMenu}
          />
        ))}
      </div>
      {/* <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onRemove}>
            <Delete />
            <span>{t("remove")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      <Menu
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorEl={anchorEl}
        onClick={closeMenu}
      >
        <MenuItem onClick={onRemove}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary={t("remove")} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default LibraryBooks;
