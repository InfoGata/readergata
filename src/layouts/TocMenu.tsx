import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTocOpen } from "../store/reducers/uiReducer";
import TableOfContents from "./TableOfContents";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const TocMenu: React.FC = () => {
  const tocOpen = useAppSelector((state) => state.ui.tocOpen);
  const dispatch = useAppDispatch();
  const onSetOpen = (open: boolean) => dispatch(setTocOpen(open));

  return (
    <Sheet open={tocOpen} onOpenChange={onSetOpen}>
      <SheetContent side="right" className="overflow-y-scroll">
        <TableOfContents />
      </SheetContent>
    </Sheet>
  );
};

export default TocMenu;
