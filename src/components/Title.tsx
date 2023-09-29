import React from "react";
import { useAppSelector } from "../store/hooks";
import { Grid, Typography } from "@mui/material";

const Title: React.FC = () => {
  const title = useAppSelector((state) => state.ui.title);
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );
  console.log(title);
  console.log(currentPublication?.fileName);

  return (
    <Grid container justifyContent="center">
      <Typography variant="subtitle1" noWrap>
        {title || currentPublication?.fileName}
      </Typography>
    </Grid>
  );
};

export default Title;
