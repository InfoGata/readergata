import { styled } from "@mui/material/styles";
import React from "react";
import { useDropzone } from "react-dropzone";
import useOpenDocument from "../hooks/useOpenDocument";

const Container = styled("div")(() => {
  return {
    minHeight: "90%",
  };
});

const DragFileContainer: React.FC<React.PropsWithChildren> = (props) => {
  const openDocument = useOpenDocument();
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        openDocument(file);
      }
    },
    [openDocument]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"], "application/epub+zip": [".epub"] },
    onDrop,
    noClick: true,
  });
  return (
    <Container {...getRootProps()}>
      <input {...getInputProps()} />
      {props.children}
    </Container>
  );
};

export default DragFileContainer;
