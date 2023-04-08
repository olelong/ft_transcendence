import { useContext, useEffect } from "react";

import Button from "react-bootstrap/Button";

import { ConvContext } from "../../pages/Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";

import CatPongImage from "../CatPongImage";

export default function Left() {
  const { setCurrConv } = useContext(ConvContext);
  return (
    <div id="chat-left" className="purple-container">
      {/* PENDING PART */}
      <p className="left-title">Pending</p>
      <Button
        className="left-avatar-button"
        onClick={() =>
          setCurrConv({
            isChan: false,
            id: "$test",
            name: "test",
            avatar: "/image/default.jpg",
          })
        }
      >
        <CatPongImage
          user={{ id: "$test", name: "test", avatar: "/image/default.jpg" }}
          className="left-avatar"
        />
        <div className="left-status" />
      </Button>

      {/* FRIENDS PART */}
      <p className="left-title">Friends</p>
      <Button
        onClick={() =>
          setCurrConv({
            isChan: false,
            id: "$test2",
            name: "test2",
            avatar: "/image/default.jpg",
          })
        }
        className="left-avatar-button"
      >
        <CatPongImage
          user={{ id: "$test2", name: "test2", avatar: "/image/default.jpg" }}
          className="left-avatar"
        />
        <div className="left-status" />
      </Button>

      {/* CHANNELS PART */}
      <p className="left-title">Channels</p>
      <Button
        onClick={() =>
          setCurrConv({
            isChan: true,
            id: 1,
            name: "wael channel -----------------",
            avatar: "/image/default.jpg",
          })
        }
        className="left-avatar-button"
      >
        <CatPongImage
          user={{ id: "1", name: "wael channel", avatar: "/image/default.jpg" }}
          className="left-avatar"
        />
        <div className="left-status" />
      </Button>
      <Button
        onClick={() =>
          setCurrConv({
            isChan: false,
            id: "CatPong's Team",
            name: "CatPong's Team",
            avatar: "/image/team.jpg",
          })
        }
        className="left-avatar-button"
      >
        <CatPongImage
          user={{ id: "1", name: "wael channel", avatar: "/image/default.jpg" }}
          className="left-avatar"
        />
        <div className="left-status" />
      </Button>
    </div>
  );
}
