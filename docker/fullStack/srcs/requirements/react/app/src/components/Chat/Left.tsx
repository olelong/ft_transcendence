import { useContext } from "react";

import { ConvContext } from "../../pages/Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";

export default function Left() {
  const { currConv, setCurrConv } = useContext(ConvContext);

  return <div id="chat-left" className="purple-container">
    <p>Friends</p>
    <div>
      <img src={currConv.avatar} alt="user's avatar" />
      <>o</>
    </div>
  </div>;
}