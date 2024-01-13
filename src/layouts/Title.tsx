import React from "react";
import { useAppSelector } from "../store/hooks";

const Title: React.FC = () => {
  const title = useAppSelector((state) => state.ui.title);
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );

  return (
    <div className="container flex justify-center">
      <div className="truncate">{title || currentPublication?.fileName}</div>
    </div>
  );
};

export default Title;
