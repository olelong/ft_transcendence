import { useContext } from "react";

import { ConvContext } from "../../pages/Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";

export default function Left() {
  const { currConv, setCurrConv } = useContext(ConvContext);

  return (
    <div id="chat-left" className="purple-container">
      <p className="left-title">Friends</p>
      <div className="left-avatar-div">
        <img
          src="https://www.oobaooba.fr/img/post/19.jpg"
          alt="user's avatar"
          className="left-avatar"
        />
        <div className="left-status"/>
      </div>
    </div>
  );
}
