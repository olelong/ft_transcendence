import { useContext } from "react";
 
import AllChannels from "./AllChannels";
import { ConvContext } from "../../../pages/Chat";

import "../../../styles/Chat/containers.css";

export default function Right() {
  const { currConv } = useContext(ConvContext);

  return (
    <div id="chat-right" className="purple-container">
      {!currConv.isChan ? (
        <AllChannels />
      ) : (
        <p>salut</p>
      )}
    </div>
  );
}
