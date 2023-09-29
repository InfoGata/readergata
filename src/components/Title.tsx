import React from "react";
import { useAppSelector } from "../store/hooks";
import { Grid, Typography } from "@mui/material";

const Title: React.FC = () => {
  const title = useAppSelector((state) => state.ui.title);

  return (
    <Grid container justifyContent="center">
      <Typography variant="subtitle1" noWrap>
        {title}
      </Typography>
    </Grid>
  );
};

export default Title;
