import React from "react";
import { useAppSelector } from "../store/hooks";
import { Grid, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const Title: React.FC = () => {
  const title = useAppSelector((state) => state.ui.title);
  const currentPublication = useAppSelector(
    (state) => state.document.currentPublication
  );

  return (
    <Grid container justifyContent="center">
      <Typography variant="subtitle1" noWrap>
        {title || currentPublication?.fileName}
      </Typography>
    </Grid>
  );
};

export default Title;
