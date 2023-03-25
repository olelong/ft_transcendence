import { useState, useEffect, useContext } from "react";

import Button from "react-bootstrap/Button";
import { GiCrossedSwords } from "react-icons/gi";

import InGameCheckWrapper from "../../../components/InGameCheckWrapper";
import { ShowStatus } from "../Right/MembersCategory";
import { ConvContext, CurrConv } from "../../../pages/Chat";
import { SocketContext } from "../../../components/Header";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Middle/Messages.css";
import "../../../styles/Chat/Right/Members.css";

export default function Messages() {
  const { currConv } = useContext(ConvContext) as { currConv: CurrConv };
  const { chatSocket } = useContext(SocketContext);
  const [userStatus, setUserStatus] = useState<{
    status?: string;
    gameid?: string;
  }>({});
  const [onUserStatus, setOnUserStatus] = useState(false);
  const [isFriend, setIsFriend] = useState<boolean>();
  const [messages, setMessages] = useState();
  const isCatPongTeam = currConv.id === "CatPong's Team";
  const isChan = currConv.isChan;
  const isUser = !isChan && !isCatPongTeam;

  // Reinitialize all states each time currConv changes
  useEffect(() => {
    setUserStatus({});
    setOnUserStatus(false);
    setIsFriend(undefined);
    setMessages(undefined);
  }, [currConv]);

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

  useEffect(() => {
    if (isFriend) {
      fetch(
        serverUrl + "/chat/users/" + currConv.id + "?from=" + 0 + "&to=" + 20,
        { credentials: "include" }
      )
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) =>
          setMessages((messages) => {
            if (!messages) return data.messages;
            return [...messages, ...data.messages];
          })
        );
    } else if (isChan) {
    } else if (isCatPongTeam) {
    }
  }, [currConv.id, isCatPongTeam, isChan, isFriend]);

  useEffect(() => {
    return () => {
      chatSocket?.off("user:status");
    };
  }, [chatSocket]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

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
      <div className="messages-container">salut</div>
      <div>salut2</div>
    </div>
  );
}
