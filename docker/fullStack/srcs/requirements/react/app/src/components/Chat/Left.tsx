import { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Modal from "react-bootstrap/Modal";

import { ConvContext, CurrConv } from "../../pages/Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";
import "../../../styles/Chat/Left/ManageChannel.css";

import CatPongImage from "../CatPongImage";
import { ShowStatus } from "./Right/MembersCategory";
import ManageChannel from "./ManageChannel";

import plus from "../../assets/icons/more.png";
import minus from "../../assets/icons/minus.png";

import { serverUrl } from "index";

// Afficher le nombre de messages non lus

// Meme popup composant pour Edit et pour Create a Channel!
// Regler scroll max height ?? car parfois ca depasse et il y a pas de scroll

// Function to leave a channel
function leaveChannel(channelId: number) {
  fetch(serverUrl + "/chat/channels/" + channelId + "/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      return;
    })
    .catch((err) => console.error(err));
  return <></>;
}

// Function to delete a channel
function deleteChannel(channelId: number, role: string) {
  if (role === "owner") {
    fetch(serverUrl + "/chat/channels/" + channelId, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        return;
      })
      .catch((err) => console.error(err));
  }
  return <></>;
}

// Function to add a member in a private channel
function addAMember(channelId: number, userId: string) {
  fetch(serverUrl + "/chat/channels/" + channelId + "/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userId),
  })
    .then((res) => res.json())
    .then((data) => {
      return;
    })
    .catch((err) => console.error(err));

  return <></>;
}

// Composant pour créer ou édit un channel
function ManageChannel() {
  return (
  <> 
  <Modal
    //show={showModalDelete}
    // onHide={() => setShowModalDelete(false)}
  >
    <Modal.Header
      closeButton
      id="btn-close-modal"
      closeVariant="white"
    >
      <Modal.Title>Confirmation</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Are you sure you want to delete this channel?
    </Modal.Body>
    <Modal.Footer>
      <Button
        className="modal-cancel-button"
        onClick={() => {/*setShowModalDelete(false)*/} }
      >
        Cancel
      </Button>
      <Button
        className="modal-delete-button"
        onClick={() => {/*
          deleteChannel(channel.id, role);
          setShowModalDelete(false);*/
        }}
      >
        Delete
      </Button>
    </Modal.Footer>
  </Modal> </>);
}

export default function Left() {
  const { currConv } = useContext(ConvContext) as { currConv: CurrConv };
  const { setCurrConv } = useContext(ConvContext);

  const [pendings, setPendings] = useState<Member[]>();
  const [friends, setFriends] = useState<Member[]>();
  const [channels, setChannels] = useState<ChannelLeft[]>();

  const [nbChanAndFriends, setNbChanAndFriends] = useState<number>(0);

  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [waitingMessages, setWaitingMessages] = useState(0);
  const [isCurrConv, setIsCurrConv] = useState<boolean>(false);

  //const { chatSocket } = useContext(SocketContext);
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
  const [openDropdownId, setOpenDropdownId] = useState<number>(-1);
  const [chanIsPrivate, setChanIsPrivate] = useState<boolean>();
  const [showModalDelete, setShowModalDelete] = useState<boolean>(false);

  //const [showModalManage, setShowModalManage] = useState<boolean>(false);

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

  // Get the number of waiting messages
  useEffect(() => {
    const socket = io(serverUrl + "/chat", { withCredentials: true });
    socket.emit("user:status", { users: friends });
    const addWaitingMsgs = () => {
      friends &&
        friends.map((friend) => {
          if (currConv.id === friend.id) setWaitingMessages(0);
          else setWaitingMessages((w) => w + 1);
        });
      //if (isCurrConv) setWaitingMessages((w) => w + 1);
    };
    socket.on("message:user", addWaitingMsgs);
    socket.on("message:channel", addWaitingMsgs);
    setChatSocket(socket);

    //if (isCurrConv) setWaitingMessages(0);

    return () => {
      chatSocket?.off("message:user", addWaitingMsgs);
      chatSocket?.off("message:channel", addWaitingMsgs);
    };
  }, [currConv, chatSocket, channels, friends]);

  /*
  const CheckIfCurrConv = (friendId: string) => {
    useEffect(() => {
      if (currConv.id === friendId) setIsCurrConv(true);
      else setIsCurrConv(false);
    }, [currConv]);
    return <></>;
  };*/
  /* Calculer le nombre de messages et afficher le nombre que lorsque 
   l'on clique sur la conversation

  Utiliser un useState pour savoir quand on clique sur la conversation
  pour savoir quand afficher le nombre de messages.
  Remettre a zero le nombre de messages en attentes des que l'on clique.
  Si on est pas sur la conversation calculer le nombre de messages.
*/

  // Affiche un message si un owner tente de quitter son propre channel
  const OwnerLeaveAlert = (
    <Tooltip id="ownerLeaveAlert">
      Warning: As the owner of this channel, you cannot leave it without
      designating another owner to take your place.
    </Tooltip>
  );

  // Affiche un message si un owner supprime un channel
  const alertDelete = (
    <Tooltip id="alertDeleteId">
      Warning: Clicking this button will permanently delete the channel and it
      cannot be recovered. Are you sure you want to proceed?
    </Tooltip>
  );

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
              onClick={() => {
                setCurrConv({
                  isChan: false,
                  id: friend.id,
                  name: friend.name,
                  avatar: friend.avatar,
                });
                //setIsCurrConv(true);
              }}
            >
              <CatPongImage user={friend} className="left-avatar" />
              {/*checkIfCurrConv(friend.id);*/}
              {currConv && currConv.id !== friend.id && waitingMessages > 0 && (
                <span>
                  <p className="waiting-messages">
                    {Math.min(waitingMessages, 9)}
                    {waitingMessages > 9 && "+"}
                  </p>
                </span>
              )}
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
          channels.map((channel) => { 
            GetRole(channel.id);
            return (
            <div>
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
                    setOpenDropdownId(channel.id);
                    //GetRole(channel.id);
                    setChanIsPrivate(channel.private);
                  }}
                >
                  {openDropdownId === channel.id &&
                    dropdownIsOpen === false && (
                      <img
                        src={plus}
                        alt="icon to see more options"
                        className="left-more-options"
                      />
                    )}
                  {openDropdownId === channel.id && dropdownIsOpen === true && (
                    <img
                      src={minus}
                      alt="icon to see less options"
                      className="left-more-options"
                    />
                  )}
                  {openDropdownId !== channel.id && (
                    <img
                      src={plus}
                      alt="icon to see more options"
                      className="left-more-options"
                    />
                  )}
                </Button>
              </Button>
              {dropdownIsOpen === true && openDropdownId === channel.id && (
                <ButtonGroup vertical className="channel-dropdown-group">
                  {/* Visible for everyone if the chan is private */}
                  {chanIsPrivate && (
                    <Button
                      className="channel-dropdown-button"
                      style={{ height: "50px" }}
                      onClick={() => {
                        //addAMember(channel.id, user.id);
                      }}
                    >
                      Add a member
                    </Button>
                  )}
                  {/* Visible for everyone but a owner can't leave his own channel */}
                  <OverlayTrigger
                    overlay={role === "owner" ? OwnerLeaveAlert : <></>}
                    placement="right"
                  >
                    <Button
                      className="channel-dropdown-button"
                      onClick={
                        role === "owner"
                          ? () => {}
                          : () => leaveChannel(channel.id)
                      }
                    >
                      Leave
                    </Button>
                  </OverlayTrigger>
                  {/* Visible only for owner */}
                  {role === "owner" && (
                    <>
                      <Button className="channel-dropdown-button">Edit</Button>
                      <OverlayTrigger overlay={alertDelete} placement="right">
                        <Button
                          onClick={() => setShowModalDelete(true)}
                          className="channel-dropdown-delete-button"
                        >
                          Delete
                        </Button>
                      </OverlayTrigger>
                      <Modal
                        show={showModalDelete}
                        onHide={() => setShowModalDelete(false)}
                      >
                        <Modal.Header
                          closeButton
                          id="btn-close-modal"
                          closeVariant="white"
                        >
                          <Modal.Title>Confirmation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          Are you sure you want to delete this channel?
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            className="modal-cancel-button"
                            onClick={() => setShowModalDelete(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="modal-delete-button"
                            onClick={() => {
                              deleteChannel(channel.id, role);
                              setShowModalDelete(false);
                            }}
                          >
                            Delete
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </>
                  )}
                </ButtonGroup>
              )}
            </div>
             )}
          )}

        {/* Create a new channel */}
        <Button
          className="left-avatar-button"
          onClick={(e) => {
            e.preventDefault();
            //setShowModalManage(true);
            < ManageChannel />
          }}
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
