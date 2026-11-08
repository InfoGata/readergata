import React from "react";
import { ChatContext } from "../contexts/ChatContext";

export const useChat = () => React.useContext(ChatContext);
