import { Button } from "@/components/ui/button";
import React from "react";
import { FaTableList } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTocOpen } from "../store/reducers/uiReducer";

const TocButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const tocOpen = useAppSelector((state) => state.ui.tocOpen);
  const onTocToggle = () => dispatch(setTocOpen(!tocOpen));

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onTocToggle}
      aria-label="contents"
    >
      <FaTableList />
    </Button>
  );
};

export default TocButton;
