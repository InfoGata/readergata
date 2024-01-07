import {
  FormControl,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import React from "react";
import { useAppDispatch } from "../store/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { setPublication } from "../store/reducers/documentReducer";
import { PublicationSourceType } from "../types";
import { Button } from "./ui/button";

const OpenUrlForm: React.FC = () => {
  const [inputUrl, setInputUrl] = React.useState("");
  const [urlType, setUrlType] = React.useState("epub");
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputUrl) {
      const url = new URL(inputUrl);
      const fileName = url.pathname.split("/").pop();
      if (urlType === "epub") {
        dispatch(
          setPublication({
            type: "ebook",
            source: inputUrl,
            sourceType: PublicationSourceType.Url,
            fileName,
          })
        );
      } else if (urlType === "pdf") {
        dispatch(
          setPublication({
            type: "pdf",
            source: inputUrl,
            sourceType: PublicationSourceType.Url,
            fileName,
          })
        );
      }
      navigate("/viewer");
    }
  };

  const onInputUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputUrl(value);
    try {
      const url = new URL(value);
      const ext = url.pathname.split(".").pop();
      switch (ext) {
        case "epub":
          setUrlType("epub");
          break;
        case "pdf":
          setUrlType("pdf");
          break;
      }
    } catch {
      /* empty */
    }
  };

  const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlType((event.target as HTMLInputElement).value);
  };

  return (
    <form onSubmit={onUrlSubmit} className="flex flex-col">
      <FormControl>
        <TextField
          value={inputUrl}
          onChange={onInputUrlChange}
          placeholder="URL"
          name="url"
        />
        <RadioGroup
          row
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={urlType}
          onChange={onRadioChange}
          className="flex flex-row justify-center"
        >
          <FormControlLabel value="epub" control={<Radio />} label="Epub" />
          <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
        </RadioGroup>
      </FormControl>
      <Button type="submit">{t("submit")}</Button>
    </form>
  );
};

export default OpenUrlForm;
