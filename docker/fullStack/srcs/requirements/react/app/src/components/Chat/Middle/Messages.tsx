import { useState, useEffect, useContext } from "react";

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
  const [isFriend, setIsFriend] = useState<boolean>();
  const [messages, setMessages] = useState<Message[]>();
  const [messagesOffset, setMessagesOffset] = useState(0);
  const messagesPerLoad = 20;
  const isCatPongTeam = currConv.id === "CatPong's Team";
  const isChan = currConv.isChan;
  const isUser = !isChan && !isCatPongTeam;

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
      setUserStatus({});
      setOnUserStatus(false);
      setIsFriend(undefined);
      setMessages(undefined);
      setOldCurrConvId(currConv.id);
    }
  }, [currConv.id, oldCurrConvId]);

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
          messagesOffset +
          messagesPerLoad,
        { credentials: "include" }
      )
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) =>
          setMessages((messages) => {
            if (!messages) return data.messages;
            if (messages.length > messagesOffset) return messages;
            return [...messages, ...data.messages];
          })
        );
    };
    if (isFriend && currConv.id === oldCurrConvId) fetchMessages("user");
    else if (isChan) fetchMessages("channel");
   /* else if (isCatPongTeam)
      setMessages((messages) => {
        if (!messages)
          return [
            "Good luck for your first games, fighting!! ⚔️",
            "    |\\__/,|   (`\\\n  _.|o o  |_   ) )\n-(((---(((--------",
            "Welcome to CatPong! 🐱🏓  You can add some friends 😉  via the searching bar above ⬆️ and join a channel via the panel on the right ➡️",
          ].map((content, i) => { return ({
            id: -1 * (i + 1),
            senderid: "CatPong's Team",
            content,
            time: new Date(),
          });});
        return messages;
      });*/
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
  }, [chatSocket]);


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
      <div className="messages-container">
        {messages && userInfos ? (
          messages.reverse().map((message) => (
            <div className="message-container">
              <CatPongImage
                user={
                  message.sender ||
                  (message.senderid === userInfos.id
                    ? userInfos
                    : {
                        id: currConv.id,
                        name: currConv.name,
                        avatar: currConv.avatar,
                      })
                }
                style={{ width: "10%", height: "auto", minWidth: "10%" }}
              />
              <div className="message-content">{message.content}</div>
            </div>
          ))
        ) : (
          <div className="spinner-container">
            <Spinner className="spinner" />
          </div>
        )}
      </div>
      <p>salut2</p>
    </div>
  );
}
