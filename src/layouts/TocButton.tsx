import { Toc } from "@mui/icons-material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTocOpen } from "../store/reducers/uiReducer";
import { Button } from "@/components/ui/button";

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
      <Toc />
    </Button>
  );
};

export default TocButton;
