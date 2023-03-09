import { useContext } from "react";

import { ConvContext } from "./Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Middle.css";

export default function Middle() {
  const { currConv, setCurrConv } = useContext(ConvContext);
  
  return (
    <div className="chat-middle">
      <div className="middle-header"></div>
      <div className="messages-container purple-container"></div>
    </div>
  );
}
