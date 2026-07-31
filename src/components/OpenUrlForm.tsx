import React from "react";
import { useAppDispatch } from "../store/hooks";
import { useTranslation } from "react-i18next";
import { setPublication } from "../store/reducers/documentReducer";
import { PublicationSourceType } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { RadioGroupItem, RadioGroup as ShRadioGroup } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useNavigate } from "@tanstack/react-router";
import { getMimeTypeForName, isPdfName } from "@/lib/ebook";

const OpenUrlForm: React.FC = () => {
  const [inputUrl, setInputUrl] = React.useState("");
  const [urlType, setUrlType] = React.useState("ebook");
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputUrl) {
      const url = new URL(inputUrl);
      const fileName = url.pathname.split("/").pop();
      if (urlType === "ebook") {
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
      navigate({ to: "/viewer" });
    }
  };

  const onInputUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputUrl(value);
    try {
      const { pathname } = new URL(value);
      if (isPdfName(pathname)) {
        setUrlType("pdf");
      } else if (getMimeTypeForName(pathname)) {
        setUrlType("ebook");
      }
    } catch {
      /* empty */
    }
  };

  const onRadioChange = (value: string) => {
    setUrlType(value);
  };

  return (
    <form onSubmit={onUrlSubmit} className="flex flex-col gap-2">
      <div className="space-y-2">
        <Input
          value={inputUrl}
          onChange={onInputUrlChange}
          placeholder="URL"
          name="url"
          className="rounded-none py-6"
        />
        <ShRadioGroup
          defaultValue="ebook"
          className="flex flex-row justify-center"
          value={urlType}
          onValueChange={onRadioChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ebook" id="r1" />
            <Label htmlFor="r1">{t("ebook")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="r2" />
            <Label htmlFor="r2">PDF</Label>
          </div>
        </ShRadioGroup>
      </div>
      <Button type="submit">{t("submit")}</Button>
    </form>
  );
};

export default OpenUrlForm;
