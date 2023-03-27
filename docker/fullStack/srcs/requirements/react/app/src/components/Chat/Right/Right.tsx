import { useContext } from "react";

import Spinner from "react-bootstrap/Spinner";

import AllChannels from "./AllChannels";
import Members from "./Members";
import { ConvContext } from "../../../pages/Chat";

import "../../../styles/Chat/containers.css";

export default function Right() {
  const { currConv } = useContext(ConvContext);

  return (
    <div id="chat-right" className="purple-container">
      {currConv ? (
        !currConv.isChan ? (
          <AllChannels />
        ) : (
          <Members />
        )
      ) : (
        <div className="spinner-container">
          <Spinner className="spinner" />
        </div>
      )}
    </div>
  );
}
