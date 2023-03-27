import { useState, useEffect, useContext, useRef } from "react";
import TextAreaAutoSize from "react-textarea-autosize";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { GiCrossedSwords } from "react-icons/gi";

import InGameCheckWrapper from "../../../components/InGameCheckWrapper";
import CatPongImage from "../../../components/CatPongImage";
import { ShowStatus } from "../Right/MembersCategory";
import { ConvContext, CurrConv } from "../../../pages/Chat";
import { SocketContext } from "../../../components/Header";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Middle/Messages.css";
import "../../../styles/Chat/Right/Members.css";
import SanctionTime from "../Right/SanctionTime";

export default function Messages() {
  const { currConv } = useContext(ConvContext) as { currConv: CurrConv };
  const { chatSocket } = useContext(SocketContext);
  const [oldCurrConvId, setOldCurrConvId] = useState(currConv.id);
  const [userInfos, setUserInfos] = useState<Member>();
  const [userStatus, setUserStatus] = useState<{
    status?: string;
    gameid?: string;
  }>({});
  const [onUserStatus, setOnUserStatus] = useState(false);
  const [muted, setMuted] = useState<{ time?: Date; timeLeft?: string }>();
  const [isFriend, setIsFriend] = useState<boolean>();
  const [message, setMessage] = useState({ content: "", sent: false });
  const [messages, setMessages] = useState<Message[]>();
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const messagesPerLoad = 20;
  const isCatPongTeam = currConv.id === "CatPong's Team";
  const isChan = currConv.isChan;
  const isUser = !isChan && !isCatPongTeam;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesDiv = useRef<HTMLDivElement>(null);
  const mutedDiv = useRef<HTMLDivElement>(null);

  // Get user informations
  useEffect(() => {
    fetch(serverUrl + "/user/profile", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) =>
        setUserInfos({ id: data.id, name: data.name, avatar: data.avatar })
      )
      .catch(console.error);
  }, []);

  // Reinitialize all states each time currConv changes
  useEffect(() => {
    if (oldCurrConvId !== currConv.id) {
      setOldCurrConvId(currConv.id);
      setUserStatus({});
      setOnUserStatus(false);
      setMuted(undefined);
      setIsFriend(undefined);
      setMessage({ content: "", sent: false });
      setMessages(undefined);
      setMessagesOffset(0);
      setAllMessagesLoaded(false);
    }
  }, [currConv.id, oldCurrConvId]);

  // Manage messages' div auto scroll
  useEffect(() => {
    if (messages && userInfos) {
      if (messages.length <= messagesPerLoad)
        messagesEndRef.current?.scrollIntoView();
      else {
        const children =
          messagesDiv.current?.querySelectorAll(".message-container");
        if (children) {
          const lastMsgBeforeLoad = children[children.length - messagesOffset];
          lastMsgBeforeLoad?.scrollIntoView({ block: "center" });
        }
      }
    }
  }, [messages, userInfos, messagesOffset]);

  // Check if I'm muted
  useEffect(() => {
    if (isChan && chatSocket) {
      fetch(serverUrl + "/chat/channels/" + currConv.id + "/role", {
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) => {
          if (data.role === "muted") setMuted({ time: data.time });
        })
        .catch(console.error);

      chatSocket.on("user:sanction", (data) => {
        if (data.id === currConv.id) {
          if (data.type === "mute") setMuted({ time: data.time });
          else window.location.reload();
        }
      });
    }

    return () => {
      chatSocket?.off("user:sanction");
    };
  }, [currConv.id, isChan, chatSocket]);

  // Update muted
  useEffect(() => {
    if (muted?.time)
      if (new Date(muted.time).getTime() < Date.now()) setMuted(undefined);
  }, [muted]);

  // Get user's status
  useEffect(() => {
    if (isUser && !onUserStatus && chatSocket) {
      setOnUserStatus(true);
      chatSocket.emit("user:status", { users: [currConv.id] });
      chatSocket.on("user:status", (user) => {
        if (user.id === currConv.id) {
          delete user.id;
          setUserStatus(user);
        }
      });
    }
  }, [isUser, onUserStatus, chatSocket, currConv.id]);

  // Check if user is a friend
  useEffect(() => {
    if (isUser && isFriend === undefined) {
      fetch(serverUrl + "/user/friends/" + currConv.id, {
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) => setIsFriend(data.ok))
        .catch(console.error);
    }
  }, [isUser, isFriend, currConv.id]);

  // Update messages if friend
  useEffect(() => {
    const fetchMessages = (type: "channel" | "user") => {
      fetch(
        serverUrl +
          "/chat/" +
          type +
          "s/" +
          currConv.id +
          (type === "channel" ? "/messages" : "") +
          "?from=" +
          messagesOffset +
          "&to=" +
          (messagesOffset + messagesPerLoad),
        { credentials: "include" }
      )
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) =>
          setMessages((messages) => {
            if (data.messages.length < messagesPerLoad)
              setAllMessagesLoaded(true);
            if (!messages) return data.messages;
            if (messages.length > messagesOffset) return messages;
            return [...messages, ...data.messages];
          })
        )
        .catch(console.error);
    };
    if (isFriend && currConv.id === oldCurrConvId) fetchMessages("user");
    else if (isChan) fetchMessages("channel");
    else if (isCatPongTeam)
      setMessages((messages) => {
        setAllMessagesLoaded(true);
        if (!messages)
          return [
            "Good luck for your first games, fighting!! ⚔️",
            "    |\\__/,|   (`\\\n  _.|o o  |_   ) )\n-(((---(((--------",
            "Welcome to CatPong! 🐱🏓 You can add some friends 😉 via the searching bar above ⬆️ and join a channel via the panel on the right ➡️",
          ].map((content, i) => ({
            id: -1 * (i + 1),
            senderid: "CatPong's Team",
            content,
            time: new Date(),
          }));
        return messages;
      });
  }, [
    isFriend,
    messagesOffset,
    isChan,
    isCatPongTeam,
    currConv.id,
    oldCurrConvId,
  ]);

  useEffect(() => {
    return () => {
      chatSocket?.off("user:status");
    };
  }, [chatSocket, currConv.id]);

  const imTheSender = (message: Message) => {
    if (!userInfos) return false;
    return (
      message.senderid === userInfos.id || message.sender?.id === userInfos.id
    );
  };

  return (
    <div className="messages-main-container">
      <div className="messages-header">
        <div style={{ display: "flex", overflow: "hidden", width: "100%" }}>
          <div style={{ overflow: "hidden", maxWidth: "90%" }}>
            <p className="user-name">{currConv.name}</p>
          </div>
          {isUser && (
            <ShowStatus
              member={userStatus}
              dontShow={false}
              styleOnOffline={{ marginTop: 11, marginLeft: 5 }}
              classNameInGame="in-game-user-status"
            />
          )}
        </div>
        {isUser && userStatus.status === "online" && (
          <InGameCheckWrapper>
            <Button
              style={{ cursor: "inherit", whiteSpace: "nowrap" }}
              className="purple-button"
            >
              Challenge
              <GiCrossedSwords size={22} style={{ marginLeft: 8 }} />
            </Button>
          </InGameCheckWrapper>
        )}
      </div>
      <div
        className="messages-container"
        onScroll={(e) => {
          if (
            e.currentTarget.scrollTop === 0 &&
            messages &&
            messages.length >= messagesPerLoad
          )
            setMessagesOffset(messagesOffset + messagesPerLoad);
        }}
        ref={messagesDiv}
      >
        {messages && !allMessagesLoaded && (
          <div className="spinner-container" style={{ paddingBottom: "5%" }}>
            <Spinner className="spinner" />
          </div>
        )}
        {messages && userInfos ? (
          [...messages].reverse().map((message) => (
            <div
              className="message-container"
              style={{
                flexDirection: imTheSender(message) ? "row-reverse" : "row",
              }}
              key={message.id}
            >
              <CatPongImage
                user={
                  message.sender ||
                  (message.senderid === userInfos.id ? userInfos : currConv)
                }
                className="message-image"
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  [imTheSender(message) ? "paddingRight" : "paddingLeft"]: "2%",
                }}
              >
                <div
                  className="message-content"
                  style={{
                    alignSelf: imTheSender(message) ? "flex-end" : "flex-start",
                    fontFamily: message.id === -2 ? "monospace" : undefined,
                    opacity: message.sent === false ? 0.6 : 1,
                  }}
                >
                  {message.content}
                </div>
                <div
                  className="message-date"
                  style={
                    imTheSender(message)
                      ? {
                          alignSelf: "flex-end",
                          paddingRight: 10,
                        }
                      : {
                          alignSelf: "flex-start",
                          paddingLeft: 10,
                        }
                  }
                >
                  {!isCatPongTeam && formatDate(message.time)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="spinner-container">
            <Spinner className="spinner" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {userInfos && chatSocket && (
        <>
          <div
            className="messages-input-container"
            style={{
              cursor:
                muted !== undefined || isCatPongTeam ? "not-allowed" : "text",
            }}
            onClick={(e) => {
              const input =
                e.currentTarget.querySelectorAll(".messages-input")[0];
              (input as HTMLInputElement).focus();
            }}
          >
            <TextAreaAutoSize
              placeholder={
                muted
                  ? "You are muted from this channel" +
                    (muted.timeLeft ? " for " + muted.timeLeft : "")
                  : isCatPongTeam
                  ? "You cannot chat with CatPong's Team ᓚᘏᗢ"
                  : "Enter your message..."
              }
              value={message.content}
              onChange={(e) => {
                setMessage((message) => {
                  if (message.sent) {
                    messagesEndRef.current?.scrollIntoView();
                    return { ...message, sent: false };
                  }
                  if (e.target.value.length > 3000) return message;
                  return { ...message, content: e.target.value };
                });
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  setMessages((messages) => {
                    if (!messages || message.content === "") return messages;
                    const messageId = getRandomIntExcluding(
                      messages.map((m) => m.id)
                    );
                    chatSocket.emit(
                      "message:" + (currConv.isChan ? "channel" : "user"),
                      { id: currConv.id, content: message.content },
                      (success: boolean) => {
                        if (success) {
                          setMessages((messages) => {
                            if (!messages) return messages;
                            messages = messages.map((m) => {
                              if (m.id === messageId) m.sent = true;
                              return m;
                            });
                            return messages;
                          });
                        }
                      }
                    );
                    return [
                      {
                        id: messageId,
                        sender: userInfos,
                        content: message.content,
                        time: new Date(),
                        sent: false,
                      },
                      ...messages,
                    ];
                  });
                  setMessage({ content: "", sent: true });
                }
              }}
              minRows={1}
              maxRows={5}
              className="messages-input"
              disabled={muted !== undefined || isCatPongTeam}
              style={{
                cursor:
                  muted !== undefined || isCatPongTeam ? "not-allowed" : "text",
              }}
            />
          </div>
          {muted && (
            <div
              data-id={userInfos.id}
              style={{ display: "none" }}
              ref={mutedDiv}
            >
              <SanctionTime
                sanctionned={[
                  {
                    id: userInfos.id,
                    time: muted.time,
                  },
                ]}
                setTimeLeft={(timeLeft: string | undefined) =>
                  setMuted({ ...muted, timeLeft })
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day}-${year} ${hours}:${minutes}`;
}

function getRandomIntExcluding(exclude: number[]) {
  const min = 0,
    max = Number.MAX_VALUE;
  let num = Math.floor(Math.random() * (max - min + 1)) + min;
  while (exclude.includes(num))
    num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}
