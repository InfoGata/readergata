import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setContent } from "../store/reducers/uiReducer";
import { BookContent } from "../types";
import { cn } from "@/lib/utils";

interface TocItemProps {
  content: BookContent;
  isNested: boolean;
  currentChapter?: BookContent;
}

const TocItem: React.FC<TocItemProps> = (props) => {
  const dispatch = useAppDispatch();
  const { content, isNested, currentChapter } = props;
  const onClick = () => {
    if (content) {
      dispatch(setContent(content));
    }
  };
  let title = content.title;
  if (content.pageNumber) {
    title += `- ${content.pageNumber}`;
  }
  let selected =
    !!currentChapter?.location && currentChapter.location === content.location;
  selected ||=
    !!currentChapter?.pageNumber &&
    currentChapter.pageNumber === content.pageNumber;
  //TODP: fix selection
  return (
    <button className="w-full p-0 text-left" onClick={onClick}>
      <div
        className={cn(
          "flex py-2 px-4 transition-all hover:bg-accent hover:text-accent-foreground",
          selected && "bg-accent",
          isNested && "ml-6"
        )}
      >
        <p>{title}</p>
      </div>
    </button>
  );
};

const TableOfContents: React.FC = () => {
  const bookContents = useAppSelector((state) => state.ui.contents);
  const currentChapter = useAppSelector((state) => state.ui.currentChapter);
  const getBookContents = (
    contents: BookContent[],
    isNested = false
  ): React.JSX.Element[] => {
    if (contents.length === 0) {
      return [];
    }

    return contents.flatMap((c) => [
      <TocItem
        key={`${c.title}-${c.pageNumber}`}
        content={c}
        isNested={isNested}
        currentChapter={currentChapter}
      />,
      ...getBookContents(c.items, true),
    ]);
  };
  return <div>{getBookContents(bookContents)}</div>;
};

export default TableOfContents;
