import { useContext, useEffect, useState } from "react";

import Button from "react-bootstrap/Button";

import { ConvContext } from "../../pages/Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";

import CatPongImage from "../CatPongImage";
import { ShowStatus } from "./Right/MembersCategory";

import { serverUrl } from "index";

export default function Left() {
  const { setCurrConv } = useContext(ConvContext);

  const [pendings, setPendings] = useState<Member[]>();
  const [friends, setFriends] = useState<Member[]>();
  const [channels, setChannels] = useState<[]>();

  const [pendingsStatus, setPendingsStatus] = useState<{
    status?: string;
    gameid?: string;
  }>();
  const [friendsStatus, setFriendsStatus] = useState<{
    status?: string;
    gameid?: string;
  }>();

  // Get all friends and pending list
  useEffect(() => {
    fetch(serverUrl + "/user/friends/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setFriends(data.friends);
        setPendings(data.pendings);
      })
      .catch((err) => console.error(err));
  }, [pendings, friends]);

    // Get user's channels list
    useEffect(() => {
      fetch(serverUrl + "/chat/channels/", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setChannels(data.channels);
        })
        .catch((err) => console.error(err));
    }, [channels]);

  pendings &&
    pendings.map((pending) => (
      <Button
        className="left-avatar-button"
        onClick={() =>
          setCurrConv({
            isChan: false,
            id: pending.id,
            name: pending.name,
            avatar: pending.avatar,
          })
        }
      >
        <CatPongImage user={pending} className="left-avatar" />
        <ShowStatus
          member={{ status: "online" }}
          styleOnOffline={{
            position: "absolute",
            top: "70%",
            left: "calc(50% + 12px)",
            width: "18%",
            height: "20%",
          }}
          styleInGame={{
            position: "absolute",
            top: "70%",
            left: "calc(50% + 12px)",
            width: "18%",
            height: "20%",
          }}
        />
      </Button>
    ));

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
          user={{ id: "$test2", name: "test2", avatar: "/image/default.jpg" }}
          className="left-avatar"
        />
        <ShowStatus
          member={{}}
          styleOnOffline={{
            position: "absolute",
            top: "70%",
            left: "calc(50% + 12px)",
            width: "18%",
            height: "20%",
          }}
          styleInGame={{
            position: "absolute",
            top: "70%",
            left: "calc(50% + 12px)",
            width: "18%",
            height: "20%",
          }}
        />
        {/*<div className="left-status" />*/}
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
    </div>
  );
}
