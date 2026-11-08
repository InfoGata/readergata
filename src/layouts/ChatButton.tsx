import { Button } from "@/components/ui/button";
import { MessageCircleIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setChatOpen } from "../store/reducers/uiReducer";

const ChatButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const chatOpen = useAppSelector((state) => state.ui.chatOpen);
  const { t } = useTranslation("chat");

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => dispatch(setChatOpen(!chatOpen))}
      aria-label={t("open")}
      title={t("open")}
    >
      <MessageCircleIcon />
    </Button>
  );
};

export default ChatButton;
