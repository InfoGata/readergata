import React from "react";
import { useDropzone } from "react-dropzone";
import useOpenDocument from "../hooks/useOpenDocument";

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
    <div className="min-h-[90%]" {...getRootProps()}>
      <input {...getInputProps()} />
      {props.children}
    </div>
  );
};

export default DragFileContainer;
