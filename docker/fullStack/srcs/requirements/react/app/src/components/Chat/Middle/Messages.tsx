import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TextAreaAutoSize from "react-textarea-autosize";

import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

import Message from "./Message";
import ChallengeButton from "../../../components/ChallengeButton";
import SanctionTime from "../Right/SanctionTime";
import { ShowStatus } from "../Right/MembersCategory";
import { ConvContext, CurrConv } from "../../../pages/Chat";
import { SocketContext } from "../../../components/Header";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Middle/Messages.css";

export default function Messages() {
  const { currConv } = useContext(ConvContext) as { currConv: CurrConv };
  const { chatSocket } = useContext(SocketContext);
  const [oldCurrConvId, setOldCurrConvId] = useState(currConv.id);
  const [myInfos, setMyInfos] = useState<Member>();
  const [userStatus, setUserStatus] = useState<{
    status?: string;
    gameid?: string;
  }>({});
  const [muted, setMuted] = useState<{ time?: Date; timeLeft?: string }>();
  const [isFriend, setIsFriend] = useState<boolean>();
  const [addingFriend, setAddingFriend] = useState(false);
  const [shouldScroll, setShouldScroll] = useState<"auto" | "down" | "no">(
    "down"
  );
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
  const navigate = useNavigate();

  // Get user informations
  useEffect(() => {
    fetch(serverUrl + "/user/profile", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) =>
        setMyInfos({ id: data.id, name: data.name, avatar: data.avatar })
      )
      .catch(console.error);
  }, []);

  // Reinitialize all states each time currConv changes
  useEffect(() => {
    if (oldCurrConvId !== currConv.id) {
      setOldCurrConvId(currConv.id);
      setUserStatus({});
      setMuted(undefined);
      setIsFriend(undefined);
      setShouldScroll("down");
      setMessage({ content: "", sent: false });
      setMessages(undefined);
      setMessagesOffset(0);
      setAllMessagesLoaded(false);
    }
  }, [currConv.id, oldCurrConvId]);

  // Manage messages' div auto scroll
  useEffect(() => {
    if (messages && myInfos && shouldScroll !== "no") {
      if (messages.length <= messagesPerLoad || shouldScroll === "down")
        messagesEndRef.current?.scrollIntoView();
      else {
        const children =
          messagesDiv.current?.querySelectorAll(".message-container");
        if (children) {
          const lastMsgBeforeLoad =
            children[children.length - messagesOffset - 1];
          lastMsgBeforeLoad?.scrollIntoView();
        }
      }
      setShouldScroll("no");
    }
  }, [messages, myInfos, messagesOffset, shouldScroll]);

  // Check if I'm muted
  useEffect(() => {
    function onUserSanction(data: UserSanctionEvData) {
      if (data.id === currConv.id) {
        if (data.type === "mute") setMuted({ time: data.time });
        else window.location.reload();
      }
    }

    if (isChan) {
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

      chatSocket?.on("user:sanction", onUserSanction);
    }

    return () => {
      chatSocket?.off("user:sanction", onUserSanction);
    };
  }, [currConv.id, isChan, chatSocket]);

  // Update muted
  useEffect(() => {
    if (muted?.time)
      if (new Date(muted.time).getTime() < Date.now()) setMuted(undefined);
  }, [muted]);

  // Get user's status
  useEffect(() => {
    function onUserStatus(user: UserStatusData) {
      if (user.id === currConv.id) setUserStatus(user);
    }

    if (isUser) {
      chatSocket?.emit("user:status", { users: [currConv.id] });
      chatSocket?.on("user:status", onUserStatus);
    }

    return () => {
      chatSocket?.off("user:status", onUserStatus);
    };
  }, [isUser, chatSocket, currConv.id]);

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

  const manageFriendship = (add: boolean) => {
    fetch(serverUrl + "/user/friends/" + currConv.id, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ add }),
    })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => {
        if (data.ok) setIsFriend(add);
      })
      .catch(console.error);
  };

  // Update messages
  useEffect(() => {
    if (currConv.id !== oldCurrConvId) return;
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
            setShouldScroll("auto");
            return [...messages, ...data.messages];
          })
        )
        .catch(console.error);
    };
    if (isFriend) fetchMessages("user");
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
    if (currConv.id !== oldCurrConvId) return;

    function onMessage(message: Message & { chanid?: number }) {
      if (message.chanid === currConv.id || message.senderid === currConv.id) {
        if (message.chanid) {
          delete message.chanid;
          if (message.sender!.id === myInfos!.id) return;
        }
        setMessages((messages) => {
          if (!messages) return messages;
          setMessagesOffset((o) => o + 1);
          setShouldScroll("down");
          return [message, ...messages];
        });
      }
    }

    if (myInfos)
      chatSocket?.on(
        "message:" + (currConv.isChan ? "channel" : "user"),
        onMessage
      );

    return () => {
      chatSocket?.off("message:channel", onMessage);
      chatSocket?.off("message:user", onMessage);
    };
  }, [chatSocket, currConv, oldCurrConvId, myInfos]);

  return (
    <div className="messages-main-container">
      <div className="messages-header">
        <div style={{ display: "flex", overflow: "hidden", width: "100%" }}>
          <div style={{ overflow: "hidden", maxWidth: "90%" }}>
            <p
              className={"user-name " + (isUser ? "user-name-hover" : "")}
              onClick={() => {
                if (isUser) navigate("/home/profile/" + currConv.id);
              }}
            >
              {currConv.name}
            </p>
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
        {isUser && (
          <ChallengeButton
            challengedUser={{ id: currConv.id as string, name: currConv.name }}
          />
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
        {isUser && isFriend === false ? (
          <div style={{ fontSize: "large" }}>
            <p>{currConv.name} wants to be your friend</p>
            <Button
              className="light-button"
              style={{ fontSize: "inherit", marginRight: 20 }}
              onClick={() => {
                manageFriendship(false);
                window.location.reload();
              }}
            >
              Decline
            </Button>
            <Button
              className="purple-button"
              style={{ fontSize: "inherit" }}
              onClick={() => {
                setAddingFriend(true);
                manageFriendship(true);
              }}
            >
              {!addingFriend ? "Accept" : <Spinner size="sm" />}
            </Button>
          </div>
        ) : messages && myInfos ? (
          [...messages]
            .reverse()
            .map((message) => (
              <Message
                message={message}
                myInfos={myInfos}
                recipientInfos={currConv}
                key={message.id}
              />
            ))
        ) : (
          <div className="spinner-container">
            <Spinner className="spinner" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {myInfos && chatSocket && (
        <>
          <div
            className="messages-input-container"
            style={{
              cursor:
                muted !== undefined || isCatPongTeam || (isUser && !isFriend)
                  ? "not-allowed"
                  : "text",
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
                  : isUser && isFriend === false
                  ? "You are not friend with " + currConv.name + " yet"
                  : "Enter your message..."
              }
              value={message.content}
              onChange={(e) => {
                setMessage((message) => {
                  if (message.sent) return { ...message, sent: false };
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
                    setMessagesOffset((o) => o + 1);
                    setShouldScroll("down");
                    return [
                      {
                        id: messageId,
                        sender: myInfos,
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
              disabled={
                muted !== undefined || isCatPongTeam || (isUser && !isFriend)
              }
              style={{
                cursor:
                  muted !== undefined || isCatPongTeam || (isUser && !isFriend)
                    ? "not-allowed"
                    : "text",
              }}
            />
          </div>
          {muted && (
            <div data-id={myInfos.id} style={{ display: "none" }}>
              <SanctionTime
                sanctionned={[
                  {
                    id: myInfos.id,
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

function getRandomIntExcluding(exclude: number[]) {
  const min = 0,
    max = Number.MAX_VALUE;
  let num = Math.floor(Math.random() * (max - min + 1)) + min;
  while (exclude.includes(num))
    num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}
