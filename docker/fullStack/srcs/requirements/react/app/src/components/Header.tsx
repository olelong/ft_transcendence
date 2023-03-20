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
import valid from "../assets/icons/valid.png";

import { serverUrl } from "../index";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import {
  manage42APILogin,
  serverLogin,
  LoginWithTfa,
  LS_KEY_42API,
  COOKIE_KEY,
} from "../utils/auth";

type SocketContextType = {
  chatSocket: Socket;
  inGame: boolean;
  setInGame: React.Dispatch<React.SetStateAction<boolean>>;
};
export const SocketContext = createContext<SocketContextType>({
  chatSocket: io(),
  inGame: false,
  setInGame: () => {},
});

export default function Header() {
  const [login, setLogin] = useState("");
  const [userInfos, setUserInfos] = useState<UserHeaderInfosProvider>();
  const [tfaRequired, setTfaRequired] = useState<boolean | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaValid, setTfaValid] = useState<boolean | null>(null);
  const [chatSocket, setChatSocket] = useState<Socket>(io());
  const [inGame, setInGame] = useState<boolean>(false);
  const [triedGameSocket, setTriedGameSocket] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (Cookies.get(COOKIE_KEY)) {
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
      if (!chatSocket.connected) {
        const socket = io(serverUrl + "/chat", { withCredentials: true });
        socket.on("connect_error", console.error);
        socket.on("disconnect", console.error);
        socket.on("error", console.error);
        setChatSocket(socket);
      }
      if (!triedGameSocket && window.location.href !== "/home/game") {
        const gameSocket = io(serverUrl + "/game", { withCredentials: true });
        setTriedGameSocket(true);
        gameSocket.on("init", () => {
          setInGame(true);
          gameSocket.disconnect();
          navigate("/home/game");
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfaRequired, tfaValid, chatSocket.connected]);

  useEffect(() => {
    if (!login) manage42APILogin(setLogin);
    else if (!Cookies.get(COOKIE_KEY)) serverLogin(setTfaRequired);
    else setTfaRequired(false);
  }, [login]);

  useEffect(() => {
    const cb = () => {
      if (tfaRequired === true && tfaValid !== true)
        localStorage.removeItem(LS_KEY_42API);
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
      <Spinner
        animation="border"
        style={{
          width: 100,
          height: 100,
        }}
      />
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
          <Nav.Link className="chat">Chat</Nav.Link>
        </LinkContainer>
      </Nav>
      <Container className="delog">
        <h2 className="id">{userInfos && userInfos.name}</h2>
        <div className="avatar-circle">
          <img
            src={userInfos && serverUrl + userInfos.avatar}
            className="avatar"
            alt="user's avatar"
          />
        </div>
        <Button
          onClick={() => {
            localStorage.removeItem(LS_KEY_42API);
            Cookies.remove(COOKIE_KEY);
            window.location.href = "/login";
          }}
          className="delog-button"
        >
          Delog
        </Button>
      </Container>
      {/*login ? (
        <SocketContext.Provider value={chatSocket}>
          <Outlet />
        </SocketContext.Provider>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      )*/}
      <SocketContext.Provider value={{ chatSocket, inGame, setInGame }}>
        <Outlet />
      </SocketContext.Provider>
    </>
  ) : (
    <div className="tfa-login-global">
      <div className="tfa-login-global-shadow">
        <div className="tfa-logo-div">
          <img src={logo} alt="CatPong's logo" className="tfa-picto" />
          <h1 className="tfa-logoName">CATPONG</h1>
        </div>
        <div className="tfa-input-div">
          <p className="tfa-input-title">
            Connection with Two Factor Authentification
          </p>
          <input
            pattern="^[\d]{6}$"
            autoComplete="off"
            placeholder="  Code"
            className="tfa-input"
            onChange={(e) => setTfaCode(e.target.value)}
          />
          <div className="tfa-valid-div">
            <img
              src={valid}
              alt="icon valid input"
              className="tfa-valid-icon"
            />
          </div>
        </div>
        <div className="tfa-button-div">
          <button
            className="tfa-button-login"
            style={{width: "30%"}}
            onClick={() => {
              setTfaValid(null);
              LoginWithTfa(tfaCode, setTfaValid);
            }}
          >
            Login
          </button>
          <button
            className="tfa-button-login"

            style={{width: "60%"}}
            onClick={() => (window.location.href = "/login")}
          >
            Back to log in
          </button>
        </div>
        {tfaValid === false && <p className="tfa-login-error-msg">Invalid code</p>}
      </div>
    </div>
  );
}
