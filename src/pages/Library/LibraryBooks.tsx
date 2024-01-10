import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { db } from "../../database";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearPublication } from "../../store/reducers/documentReducer";
import { clearBookData } from "../../store/reducers/uiReducer";
import { DocumentData } from "../../types";
import { getDocumentData } from "../../utils";
import LibraryBook from "./LibraryBook";

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

  const onRemove = async (document: DocumentData) => {
    if (document.id) {
      if (currentDocument?.id === document.id) {
        dispatch(clearPublication());
        dispatch(clearBookData());
      }
      await db.documentData.delete(document.id);
    }
  };

  return (
    <div>
      {documents?.map((d) => (
        <LibraryBook
          key={d.url || d.xxhash64}
          documentData={d}
          removeDocument={onRemove}
        />
      ))}
    </div>
  );
};

export default LibraryBooks;
