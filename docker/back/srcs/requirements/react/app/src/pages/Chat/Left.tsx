import { useContext } from "react";

import { ConvContext } from "./Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";

export default function Left() {
  const { currConv, setCurrConv } = useContext(ConvContext);

  return <div className="chat-left purple-container"></div>;
}
