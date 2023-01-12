import { Outlet } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { LinkContainer } from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/header.css";

import logo from "../assets/main/pictoGrand.png";
//import avatar from "../assets/avatar/lapin.jpg";

import { serverUrl } from "../index";
import { useEffect, useState } from "react";

interface UserInfosProvider {
  id: string;
  avatar: string;
}

export default function Header() {
  const [userInfos, setUserInfos] = useState<UserInfosProvider>();

  useEffect(() => {
    fetch(serverUrl + "user/profile")
      .then((res) => res.json())
      .then((data) => setUserInfos({ id: data.id, avatar: data.avatar }))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <Navbar>
        <Navbar.Brand href="/home/play" className="logo">
          <img src={logo} alt="CatPong's logo" className="picto" />
          <h1 className="logoName">CATPONG</h1>
        </Navbar.Brand>
      </Navbar>
      <Nav className="nav">
        <LinkContainer to="/home/profile" activeClassName="active-nav">
          <Nav.Link className="profile">Profile</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/home/play" activeClassName="active-nav">
          <Nav.Link className="play">Play</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/home/chat" activeClassName="active-nav">
          <Nav.Link className="chat">Chat</Nav.Link>
        </LinkContainer>
      </Nav>
      <Container className="delog">
        <h2 className="id">{userInfos && userInfos.id}</h2>
        <div className="avatar-circle">
          <img src={userInfos && userInfos.avatar} className="avatar" alt="user's avatar" />
        </div>
        <Button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="delog-button"
        >
          Delog
        </Button>
      </Container>
      <Outlet />
    </>
  );
}
