import { useContext, useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Modal from "react-bootstrap/Modal";

import { ConvContext, CurrConv } from "../../../pages/Chat";
import { LoginContext, SocketContext } from "../../../components/Header";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/containers.css";
import "../../../styles/Chat/Left/Left.css";

import CatPongImage from "../../CatPongImage";
import ShowStatus from "../../../components/ShowStatus";
import ManageChannel from "./ManageChannel";
import AddAMember from "./AddAMember";

import plus from "../../../assets/icons/more.png";
import minus from "../../../assets/icons/minus.png";

import { serverUrl } from "index";

// Function to leave a channel
function leaveChannel(
  channelId: number,
  channels: ChannelLeft[],
  setChannels: (channels: ChannelLeft[]) => void
) {
  fetch(serverUrl + "/chat/channels/" + channelId + "/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.json();
    })
    .then((data) => {
      setChannels(channels.filter((channel) => channel.id !== channelId));
    })
    .catch(console.error);
  return <></>;
}

// Function to delete a channel
function deleteChannel(
  channelId: number,
  role: "member" | "owner" | "admin" | "banned" | "muted" | undefined,
  channels: ChannelLeft[],
  setChannels: (channels: ChannelLeft[]) => void
) {
  if (role === "owner") {
    fetch(serverUrl + "/chat/channels/" + channelId, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) return res.json();
      })
      .then((data) => {
        setChannels(channels.filter((channel) => channel.id !== channelId));
      })
      .catch(console.error);
  }
  return <></>;
}

export default function Left() {
  const { currConv } = useContext(ConvContext) as { currConv: CurrConv };
  const { setCurrConv } = useContext(ConvContext);

  const [pendings, setPendings] = useState<UserSocket[]>();
  const [friends, setFriends] =
    useState<(UserSocket & { waitingMessages?: number })[]>();
  const [channels, setChannels] =
    useState<(ChannelLeft & { waitingMessages?: number })[]>();

  const { chatSocket } = useContext(SocketContext);
  const [emitted, setEmitted] = useState(false);

  const [showModalDelete, setShowModalDelete] = useState<boolean>(false);
  const [showModalManage, setShowModalManage] = useState<boolean>(false);
  const [isExisted, setIsExisted] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);

  const [showModalMember, setShowModalMember] = useState<boolean>(false);

  const login = useContext(LoginContext);

  // Get all friends and pending list
  useEffect(() => {
    if (friends === undefined) {
      fetch(serverUrl + "/user/friends/", {
        credentials: "include",
      })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) return res.json();
        })
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
        .catch(console.error);
    }
  }, [pendings, friends]);

  // Get user's channels list
  useEffect(() => {
    if (channels === undefined) {
      fetch(serverUrl + "/chat/channels/", {
        credentials: "include",
      })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) return res.json();
        })
        .then((data) => {
          data.channels = data.channels.map((c: ChannelLeft) => ({
            ...c,
            dropdownOpen: false,
          }));
          setChannels(data.channels);
        })
        .catch(console.error);
    }
  }, [channels]);

  // Get the user's role in a channel
  useEffect(() => {
    if (channels && channels.some((c) => c.role === undefined)) {
      for (const channel of channels) {
        fetch(serverUrl + "/chat/channels/" + channel.id + "/role", {
          credentials: "include",
        })
          .then((res) => {
            if (res.status >= 200 && res.status < 300) return res.json();
          })
          .then((data) => {
            setChannels((channels) => {
              if (!channels) return channels;
              const chanId = channels.findIndex((c) => c.id === channel.id);
              if (chanId === -1) return channels;
              if (channels[chanId].role) return channels;
              const channelsCopie = [...channels];
              channelsCopie.splice(chanId, 1, {
                ...channels[chanId],
                role: data.role,
              });
              return channelsCopie;
            });
          })
          .catch(console.error);
      }
    }
  }, [channels]);

  // Get the number of waiting messages
  useEffect(() => {
    if (!friends || !channels) return;

    function addWaitingMsgs(msg: Message) {
      // Message from a channel
      if (msg.hasOwnProperty("chanid")) {
        setChannels((channels) => {
          if ((msg as ChannelMessage).sender.id === login) return channels;
          if (!channels) return channels;
          const channelIndex = channels.findIndex(
            (c) => c.id === (msg as ChannelMessage).chanid
          );
          if (channelIndex === -1) return channels;
          const channelsCp = [...channels];
          channelsCp.splice(channelIndex, 1, {
            ...channels[channelIndex],
            waitingMessages: (channels[channelIndex].waitingMessages || 0) + 1,
          });
          return channelsCp;
        });
      } else {
        // Message from a user
        setFriends((friends) => {
          if (!friends) return friends;
          const friendIndex = friends.findIndex(
            (f) => f.id === (msg as UserMessage).senderid
          );
          if (friendIndex === -1) return friends;
          const friendsCp = [...friends];
          friendsCp.splice(friendIndex, 1, {
            ...friends[friendIndex],
            waitingMessages: (friends[friendIndex].waitingMessages || 0) + 1,
          });
          return friendsCp;
        });
      }
    }

    chatSocket?.on("message:user", addWaitingMsgs);
    chatSocket?.on("message:channel", addWaitingMsgs);

    return () => {
      chatSocket?.off("message:user", addWaitingMsgs);
      chatSocket?.off("message:channel", addWaitingMsgs);
    };
  }, [channels, chatSocket, friends, login]);

  // Affiche un message si un owner tente de quitter son propre channel
  const OwnerLeaveAlert = (
    <Tooltip id="ownerLeaveAlert" className="custom-tooltip" placement="right">
      Warning: As the owner of this channel, you cannot leave it without
      designating another owner to take your place.
    </Tooltip>
  );

  // Affiche un message si un owner supprime un channel
  const alertDelete = (
    <Tooltip id="alertDeleteId" className="custom-tooltip" placement="right">
      Warning: Clicking this button will permanently delete the channel and it
      cannot be recovered. Are you sure you want to proceed?
    </Tooltip>
  );

  const [id, setId] = useState<number | undefined>();

  // Set the default currConv:
  useEffect(() => {
    if (currConv === null) {
      if (pendings && pendings.length > 0) {
        setCurrConv({
          isChan: false,
          id: pendings[0].id,
          name: pendings[0].name,
          avatar: pendings[0].avatar,
        });
      } else {
        if (friends) {
          setCurrConv({
            isChan: false,
            id: friends[0].id,
            name: friends[0].name,
            avatar: friends[0].avatar,
          });
        }
      }
    }
  }, [pendings, friends, currConv, setCurrConv]);

  // Update and show status
  function setUserStatus(
    users: UserSocket[] | undefined,
    user: UserStatusEvData
  ) {
    if (!users) return users;
    const userIndex = users.findIndex((u: UserSocket) => u.id === user.id);
    if (userIndex === -1) return users;
    const usersCp = [...users];
    usersCp.splice(userIndex, 1, {
      ...users[userIndex],
      status: user.status,
      gameid: user.gameid,
    });
    return usersCp;
  }

  useEffect(() => {
    if (!friends || !pendings) return;

    if (!emitted) {
      chatSocket?.emit("user:status", {
        users: [...friends, ...pendings].map((user) => user.id), // On concatene les friends et pendings et on les transforment ensuite en un nouveau tableau de string avec map qui retournera les id de chaque user.
      });
      setEmitted(true);
    }

    function onUserStatus(user: UserStatusEvData) {
      if (!friends || !pendings) return;
      if (friends.find((friend) => friend.id === user.id)) {
        setFriends((friends) => setUserStatus(friends, user));
      } else if (pendings.find((pending) => pending.id === user.id)) {
        setPendings((pendings) => setUserStatus(pendings, user));
      }
    }
    chatSocket?.on("user:status", onUserStatus);

    return () => {
      chatSocket?.off("user:status", onUserStatus);
    };
  }, [chatSocket, emitted, friends, pendings]);

  return (
    <div id="chat-left" className="purple-container">
      <div className="left-global">
        {/* PENDING PART */}
        {pendings && pendings.length > 0 && (
          <p className="left-title">Pending</p>
        )}
        {pendings &&
          currConv &&
          pendings.map((pending, index) => (
            <Button
              className="left-avatar-button"
              style={
                currConv.id === pending.id
                  ? { backgroundColor: "var(--light-white)" }
                  : {}
              }
              onClick={() =>
                setCurrConv({
                  isChan: false,
                  id: pending.id,
                  name: pending.name,
                  avatar: pending.avatar,
                })
              }
              key={index}
            >
              <CatPongImage user={pending} className="left-avatar" />
              <ShowStatus
                user={pending}
                styleOnOffline={{
                  position: "absolute",
                  top: "70%",
                  left: "calc(50% + 12px)",
                  width: "18%",
                  height: "20%",
                }}
                styleInGame={{
                  position: "absolute",
                  top: "65%",
                  left: "calc(50% + 10px)",
                  width: "30%",
                  height: "30%",
                }}
                classNameTooltip="tooltip-in-game"
              />
            </Button>
          ))}
        {/* FRIENDS PART */}
        <p className="left-title">Friends</p>
        {friends &&
          currConv &&
          friends.map((friend, index) => (
            <Button
              className="left-avatar-button"
              style={
                currConv.id === friend.id
                  ? { backgroundColor: "var(--light-white)" }
                  : {}
              }
              onClick={() => {
                setCurrConv({
                  isChan: false,
                  id: friend.id,
                  name: friend.name,
                  avatar: friend.avatar,
                });
                setFriends((friends) => {
                  if (!friends) return friends;
                  const friendIndex = friends.findIndex(
                    (f) => f.id === friend.id
                  );
                  if (friendIndex === -1) return friends;
                  const friendsCp = [...friends];
                  friendsCp.splice(friendIndex, 1, {
                    ...friends[friendIndex],
                    waitingMessages: 0,
                  });
                  return friendsCp;
                });
              }}
              key={index}
            >
              <CatPongImage user={friend} className="left-avatar" />
              {currConv &&
                currConv.id !== friend.id &&
                (friend.waitingMessages || 0) > 0 && (
                  <span>
                    <p className="waiting-messages">
                      {Math.min(friend.waitingMessages || 0, 9)}
                      {(friend.waitingMessages || 0) > 9 && "+"}
                    </p>
                  </span>
                )}
              {friend.id !== "CatPong's Team" && (
                <ShowStatus
                  user={friend}
                  styleOnOffline={{
                    position: "absolute",
                    top: "70%",
                    left: "calc(50% + 12px)",
                    width: "18%",
                    height: "20%",
                  }}
                  styleInGame={{
                    position: "absolute",
                    top: "65%",
                    left: "calc(50% + 10px)",
                    width: "30%",
                    height: "30%",
                  }}
                  classNameTooltip="tooltip-in-game"
                />
              )}
            </Button>
          ))}
        {/* CHANNELS PART */}
        <p className="left-title">Channels</p>
        {channels &&
          currConv &&
          channels.map((channel, index) => {
            return (
              channel.id && (
                <div key={index}>
                  <Button
                    className="left-avatar-button"
                    style={
                      currConv.id === channel.id
                        ? { backgroundColor: "var(--light-white)" }
                        : {}
                    }
                    onClick={() => {
                      setCurrConv({
                        isChan: true,
                        id: channel.id as number,
                        name: channel.name,
                        avatar: channel.avatar,
                      });
                      setChannels((channels) => {
                        if (!channels) return channels;
                        const channelIndex = channels.findIndex(
                          (c) => c.id === channel.id
                        );
                        if (channelIndex === -1) return channels;
                        const channelsCp = [...channels];
                        channelsCp.splice(channelIndex, 1, {
                          ...channels[channelIndex],
                          waitingMessages: 0,
                        });
                        return channelsCp;
                      });
                    }}
                  >
                    <CatPongImage user={channel} className="left-avatar" />
                    {currConv &&
                      currConv.id !== channel.id &&
                      (channel.waitingMessages || 0) > 0 && (
                        <span>
                          <p className="waiting-messages">
                            {Math.min(channel.waitingMessages || 0, 9)}
                            {(channel.waitingMessages || 0) > 9 && "+"}
                          </p>
                        </span>
                      )}
                    <div
                      className="left-more-options-button"
                      onClick={() => {
                        setChannels((channels) => {
                          if (!channels) return channels;
                          const channelIndex = channels.findIndex(
                            (c) => c.id === channel.id
                          );
                          if (channelIndex === -1) return channels;
                          const channelsCp = [...channels];
                          channelsCp.splice(channelIndex, 1, {
                            ...channel,
                            dropdownOpen: !channel.dropdownOpen,
                          });
                          return channelsCp;
                        });
                      }}
                    >
                      {!channel.dropdownOpen ? (
                        <img
                          src={plus}
                          alt="icon to see more options"
                          className="left-more-options"
                        />
                      ) : (
                        <img
                          src={minus}
                          alt="icon to see less options"
                          className="left-more-options"
                        />
                      )}
                    </div>
                  </Button>
                  {channel.dropdownOpen && (
                    <ButtonGroup vertical className="channel-dropdown-group">
                      {/* Visible for everyone if the chan is private */}
                      {channel.private === true && (
                        <>
                          <Button
                            className="channel-dropdown-button"
                            style={{ height: "50px" }}
                            onClick={() => {
                              setShowModalMember(true);
                              setShowSearchBar(true);
                            }}
                          >
                            Add a member
                          </Button>
                          {showSearchBar === true && (
                            <AddAMember
                              channelId={channel.id}
                              showModalMember={showModalMember}
                              setShowModalMember={setShowModalMember}
                            />
                          )}
                        </>
                      )}
                      {/* Visible for everyone but a owner can't leave his own channel */}
                      <OverlayTrigger
                        overlay={
                          channel.role === "owner" ? OwnerLeaveAlert : <></>
                        }
                        placement="right"
                      >
                        <Button
                          className="channel-dropdown-button"
                          onClick={
                            channel.role === "owner"
                              ? () => {}
                              : () =>
                                  leaveChannel(
                                    channel.id as number,
                                    channels,
                                    setChannels
                                  )
                          }
                        >
                          Leave
                        </Button>
                      </OverlayTrigger>
                      {/* Visible only for owner */}
                      {channel.role && channel.role === "owner" && (
                        <>
                          <Button
                            className="channel-dropdown-button"
                            onClick={(e) => {
                              setShowModalManage(true);
                              setIsExisted(true);
                              setId(channel.id);
                            }}
                          >
                            Edit
                          </Button>
                          <OverlayTrigger
                            overlay={alertDelete}
                            placement="right"
                          >
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
                                  deleteChannel(
                                    channel.id as number,
                                    channel.role,
                                    channels,
                                    setChannels
                                  );
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
              )
            );
          })}

        {/* Create a new channel */}
        <Button
          className="left-avatar-button"
          onClick={(e) => {
            setShowModalManage(true);
            setIsExisted(false);
            setId(undefined);
          }}
        >
          <img
            src={plus}
            alt="icon for create a channel"
            className="create-channel"
          />
        </Button>

        <ManageChannel
          channelToEdit={
            id !== undefined && channels
              ? channels.find((c) => c.id === id)
              : undefined
          }
          showModalManage={showModalManage}
          setShowModalManage={setShowModalManage}
          channels={channels}
          setChannels={setChannels}
          isExisted={isExisted}
        />
      </div>
    </div>
  );
}
