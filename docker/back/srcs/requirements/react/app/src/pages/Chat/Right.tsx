import { useContext } from "react";

import { ConvContext } from "./Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Right.css";

export default function Right() {
  const { currConv, setCurrConv } = useContext(ConvContext);

  return <div className="chat-right purple-container"></div>;
}
