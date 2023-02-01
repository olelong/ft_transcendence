import { Outlet } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { LinkContainer } from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Header.css";

import logo from "../assets/main/pictoGrand.png";
//import avatar from "../assets/avatar/lapin.jpg";

import { serverUrl } from "../index";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import {
  manage42APILogin,
  serverLogin,
  LoginWithTfa,
  LS_KEY_42API,
  COOKIE_KEY,
} from "../utils/auth";

export default function Header() {
  const [login, setLogin] = useState("");
  const [userInfos, setUserInfos] = useState<UserHeaderInfosProvider>();
  const [tfaRequired, setTfaRequired] = useState<boolean | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaValid, setTfaValid] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(serverUrl + "/user/profile")
      .then((res) => res.json())
      .then((data) => setUserInfos({ id: data.id, avatar: data.avatar }))
      .catch((err) => console.error(err));
  }, []);

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
        <h2 className="id">{login || (userInfos && userInfos.id)}</h2>
        <div className="avatar-circle">
          <img
            src={userInfos && userInfos.avatar && serverUrl + userInfos.avatar}
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
      {login ? (
        <Outlet />
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Spinner animation="border" className="loader" />
        </div>
      )}
    </>
  ) : (
    <div style={{ position: "relative", top: 500 }}>
      <input onChange={(e) => setTfaCode(e.target.value)} />
      <button
        onClick={() => {
          setTfaValid(null);
          LoginWithTfa(tfaCode, setTfaValid);
        }}
      >
        Login
      </button>
      <button onClick={() => (window.location.href = "/login")}>
        Back to log in
      </button>
      {tfaValid === false && <p style={{ color: "red" }}>Invalid code</p>}
    </div>
  );
}