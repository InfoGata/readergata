import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { setBook } from "../store/reducers/ebookReducer";
import { PublicationSource } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { BookSourceType, EBook } from "../models";

interface PublicationSourceButtonProps {
  source: PublicationSource;
}

const PublicationSourceButton: React.FC<PublicationSourceButtonProps> = (
  props
) => {
  const { source } = props;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onClick = () => {
    const book: EBook = {
      source: source.source,
      sourceType: BookSourceType.Url,
    };
    console.log(book);
    navigate("/");
    dispatch(setBook(book));
  };
  return <Button onClick={onClick}>{source.name}</Button>;
};

export default PublicationSourceButton;
