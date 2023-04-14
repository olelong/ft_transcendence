import { useContext, useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

import { ConvContext } from "../../pages/Chat";
import { SocketContext } from "../Header";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";

import CatPongImage from "../CatPongImage";
import { ShowStatus } from "./Right/MembersCategory";

//import more from "../../assets/icons/three-dots.png";
import plus from "../../assets/icons/more.png";

import { serverUrl } from "index";

// Afficher le nombre de messages non lus

// Meme popup composant pour Edit et pour Create a Channel!
// Afficher un avertissement en hover de l'option delete !!

export default function Left() {
  const { setCurrConv } = useContext(ConvContext);

  const [pendings, setPendings] = useState<Member[]>();
  const [friends, setFriends] = useState<Member[]>();
  const [channels, setChannels] = useState<Channel[]>();

  const [nbChanAndFriends, setNbChanAndFriends] = useState<number>(0);

  const { chatSocket } = useContext(SocketContext);
  const [pendingsStatus, setPendingsStatus] = useState<{
    status?: string;
    gameid?: string;
    id: string;
  }>();
  const [friendsStatus, setFriendsStatus] = useState<{
    status?: string;
    gameid?: string;
    id: string;
  }>();

  const [role, setRole] = useState<
    "member" | "admin" | "owner" | "muted" | "banned"
  >("member");

  const [dropdownIsOpen, setdropdownIsOpen] = useState<boolean>(false);

  // Get all friends and pending list
  useEffect(() => {
    fetch(serverUrl + "/user/friends/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setFriends([
          ...data.friends,
          {
            id: "CatPong's Team",
            name: "CatPong's Team",
            avatar: "/image/team.jpg",
          },
        ]);
        setPendings(data.pending);
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

  // Get the total number of channels, friends and pendings
  const getTotalSize = () => {
    setNbChanAndFriends(0);
    let friendsSize = friends ? friends.length : 0;
    let pendingsSize = pendings ? pendings.length : 0;
    let channelsSize = channels ? channels.length : 0;
    return friendsSize + pendingsSize + channelsSize;
  };

  useEffect(() => {
    setNbChanAndFriends(getTotalSize());
  }, [friends, channels, pendings]);

  // Get the user's role in a channel
  function GetRole(channelId: number) {
    fetch(serverUrl + "/chat/channels/" + channelId + "/role", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setRole(data.role);
        console.log("role: ", role);
      })
      .catch((err) => console.error(err));
  }

  return (
    <div id="chat-left" className="purple-container">
      <div
        className="left-global"
        style={{
          overflowY:
            nbChanAndFriends && nbChanAndFriends > 5 ? "scroll" : "hidden",
        }}
      >
        {/* PENDING PART */}
        {pendings && pendings.length > 0 && (
          <p className="left-title">Pending</p>
        )}
        {pendings &&
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
          ))}
        {/* FRIENDS PART */}
        <p className="left-title">Friends</p>
        {friends &&
          friends.map((friend) => (
            <Button
              className="left-avatar-button"
              onClick={() =>
                setCurrConv({
                  isChan: false,
                  id: friend.id,
                  name: friend.name,
                  avatar: friend.avatar,
                })
              }
            >
              <CatPongImage user={friend} className="left-avatar" />
              {friend.id !== "CatPong's Team" && (
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
              )}
            </Button>
          ))}
        {/* CHANNELS PART */}
        <p className="left-title">Channels</p>
        {channels &&
          channels.map((channel) => (
            <Button
              className="left-avatar-button"
              onClick={() =>
                setCurrConv({
                  isChan: true,
                  id: channel.id,
                  name: channel.name,
                  avatar: channel.avatar,
                })
              }
            >
              <CatPongImage user={channel} className="left-avatar" />
              <Button
                className="left-more-options-button"
                onClick={() => {
                  setdropdownIsOpen(!dropdownIsOpen);
                  GetRole(channel.id);
                }}
              >
                <img
                  src={plus}
                  alt="icon to see more options"
                  className="left-more-options"
                />
              </Button>
              {dropdownIsOpen && (
                <ButtonGroup vertical>
                  <Button>Leave</Button> {/* Visible for everyone */}
                  {channel.protected && <Button>Add a member</Button>}{" "}
                  {/* Visible for everyone if the chan is private */}
                  {role === "owner" && (
                    <>
                      <Button>Edit</Button> {/* Visible only for owner */}
                      <Button>Delete</Button> {/* Visible only for owner */}
                    </>
                  )}
                  ;
                </ButtonGroup>
              )}
              ;
            </Button>
          ))}
        ;{/* Create a new channel */}
        <Button
          className="left-avatar-button"
          onClick={(e) => e.preventDefault()}
        >
          <img
            src={plus}
            alt="icon for create a channel"
            className="create-channel"
          />
        </Button>
      </div>
    </div>
  );
}
