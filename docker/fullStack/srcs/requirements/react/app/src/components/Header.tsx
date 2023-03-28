import { Outlet } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { LinkContainer } from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Header.css";

import logo from "../assets/main/pictoGrand.png";

import { serverUrl } from "../index";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import {
  manage42APILogin,
  serverLogin,
  loginWithTfa,
  LS_KEY_42API,
  LS_KEY_LOGIN,
  COOKIE_KEY,
  getLoginInLS,
} from "../utils/auth";
import LoginTfa from "./LoginTfa";
import CatPongImage from "./CatPongImage";

type SocketContextType = {
  chatSocket: Socket | null;
  inGame: boolean;
  setInGame: React.Dispatch<React.SetStateAction<boolean>>;
};
export const SocketContext = createContext<SocketContextType>({
  chatSocket: null,
  inGame: false,
  setInGame: () => {},
});
export const LoginContext = createContext<string>("");

export default function Header() {
  const [login, setLogin] = useState("");
  const [userInfos, setUserInfos] = useState<UserHeaderInfosProvider>();
  const [tfaRequired, setTfaRequired] = useState<boolean | null>(null);
  const [tfaValid, setTfaValid] = useState<boolean | null>(null);
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [chatSocketStatus, setChatSocketStatus] = useState<string>();
  const [triedGameSocket, setTriedGameSocket] = useState(false);
  const [inGame, setInGame] = useState<boolean>(false);
  const [waitingMessages, setWaitingMessages] = useState(0);
  const [reRender, setReRender] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get(COOKIE_KEY) && tfaRequired && tfaValid)
      setReRender(!reRender);
    if (Cookies.get(COOKIE_KEY) && !userInfos)
      fetch(serverUrl + "/user/profile", { credentials: "include" })
        .then((res) => {
          if (res.status === 404 || res.status === 401)
            window.location.href = "/login";
          if (res.status >= 200 && res.status < 300) return res.json();
        })
        .then((data) =>
          setUserInfos({ id: data.id, name: data.name, avatar: data.avatar })
        )
        .catch((err) => console.error(err));
    if (!chatSocketStatus && Cookies.get(COOKIE_KEY) && login) {
      setChatSocketStatus("connecting");
      const socket = io(serverUrl + "/chat", { withCredentials: true });
      socket.on("connect_error", console.error);
      socket.on("connect", () => {
        setChatSocketStatus("connected");
        socket.on("disconnect", console.error);
        socket.emit("user:status", { users: [login] });
        setChatSocket(socket);
      });
    }
    if (
      !triedGameSocket &&
      chatSocketStatus === "connected" &&
      window.location.pathname !== "/home/game"
    ) {
      const gameSocket = io(serverUrl + "/game", { withCredentials: true });
      setTriedGameSocket(true);
      gameSocket.on("init", () => {
        setInGame(true);
        gameSocket.disconnect();
        navigate("/home/game");
      });
    }
    // Manage global event listeners
    if (chatSocket) {
      const noListener = (event: string) =>
        chatSocket.listeners(event).length === 0;
      if (noListener("error")) chatSocket.on("error", console.error);
      if (noListener("user:status"))
        chatSocket.on("user:status", (member) => {
          if (member.id === login) setInGame(member.status === "ingame");
        });
      const addWaitingMsgs = () => {
        if (window.location.pathname !== "/home/chat")
          setWaitingMessages((w) => w + 1);
      };
      ["message:user", "message:channel"].forEach((event) => {
        if (noListener(event)) chatSocket.on(event, addWaitingMsgs);
      });
    }
    if (window.location.pathname === "/home/chat") setWaitingMessages(0);
  }, [
    tfaRequired,
    tfaValid,
    userInfos,
    triedGameSocket,
    navigate,
    login,
    chatSocketStatus,
    reRender,
    chatSocket,
  ]);

  useEffect(() => {
    if (!login && !getLoginInLS(setLogin)) manage42APILogin(setLogin);
    else if (!Cookies.get(COOKIE_KEY)) serverLogin(setTfaRequired);
    else setTfaRequired(false);
  }, [login]);

  useEffect(() => {
    const cb = () => {
      if (tfaRequired === true && tfaValid !== true) {
        localStorage.removeItem(LS_KEY_42API);
        localStorage.removeItem(LS_KEY_LOGIN);
      }
    };
    window.addEventListener("beforeunload", cb);
    return () => window.removeEventListener("beforeunload", cb);
  }, [tfaRequired, tfaValid]);

  return tfaRequired === null ? (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Spinner animation="border" className="spinner" />
    </div>
  ) : tfaRequired === false || (tfaRequired && tfaValid) ? (
    <>
      <Navbar>
        <Navbar.Brand href="/home/play" className="logo">
          <img src={logo} alt="CatPong's logo" className="picto" />
          <h1 className="logoName">CATPONG</h1>
        </Navbar.Brand>
      </Navbar>
      <Nav className="catpong-nav">
        <LinkContainer to="/home/profile" activeClassName="active-catpong-nav">
          <Nav.Link className="profile">Profile</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/home/play" activeClassName="active-catpong-nav">
          <Nav.Link className="play">Play</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/home/chat" activeClassName="active-catpong-nav">
          <Nav.Link className="chat">
            Chat
            {waitingMessages > 0 && (
              <span className="chat-notif">
                <p>
                  {Math.min(waitingMessages, 9)}
                  {waitingMessages > 9 && "+"}
                </p>
              </span>
            )}
          </Nav.Link>
        </LinkContainer>
      </Nav>
      <Container className="delog">
        <h2 className="id">{userInfos && userInfos.name}</h2>
        {userInfos && (
          <CatPongImage user={userInfos} className="avatar-circle" />
        )}
        <Button
          onClick={() => {
            localStorage.removeItem(LS_KEY_42API);
            localStorage.removeItem(LS_KEY_LOGIN);
            Cookies.remove(COOKIE_KEY);
            window.location.href = "/login";
          }}
          className="delog-button"
        >
          Delog
        </Button>
      </Container>
      {login ? (
        <SocketContext.Provider value={{ chatSocket, inGame, setInGame }}>
          <LoginContext.Provider value={login}>
            <Outlet />
          </LoginContext.Provider>
        </SocketContext.Provider>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      )}
    </>
  ) : (
    <LoginTfa
      tfaValid={tfaValid}
      setTfaValid={setTfaValid}
      loginWithTfa={(tfaCode) => loginWithTfa(tfaCode, setTfaValid)}
    />
  );
}
