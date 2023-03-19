import { useContext } from "react";
 
import { ConvContext } from "../../pages/Chat";

import "../../styles/Chat/containers.css";

export default function Right() {
  const { currConv } = useContext(ConvContext);

  return (
    <div id="chat-right" className="purple-container">
      <p>Hello</p>
    </div>
  );
}