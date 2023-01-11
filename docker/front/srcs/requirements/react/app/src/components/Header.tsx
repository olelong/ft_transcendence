import { Link, Outlet } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from "react-router-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/header.css'

import logo from '../assets/main/pictoGrand.png';
import { Nav } from "react-bootstrap";


export default function Header() {
  return (
    <div className="header">
      <Navbar>
      <Navbar.Brand href="/home/play" className="logo">
        <img src={logo} alt="CatPong's logo" width="30"/>
        <h1 className="logoName" >CATPONG</h1>
      </Navbar.Brand>
      </Navbar>
      <Navbar className="nav">
      <LinkContainer to="/home/profile" activeClassName="active-profile">
        <Nav.Link className="profile"> Profile</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/home/play" activeClassName="active-play">
        <Nav.Link className="play"> Play</Nav.Link>
      </LinkContainer>
      <LinkContainer to="/home/chat" activeClassName="active-chat">
        <Nav.Link className="chat"> Chat</Nav.Link>
      </LinkContainer>
      </Navbar>
      <Outlet />
    </div>
  );
}

//<LinkContainer to="/home/profile" activeClassName="active-profile">
//<Nav.Link className="profile"> Profile</Nav.Link>
//</LinkContainer>
//<LinkContainer to="/home/play" activeClassName="active-play">
//<Nav.Link className="play"> Play</Nav.Link>
//</LinkContainer>
//<LinkContainer to="/home/chat" activeClassName="active-chat">
//<Nav.Link className="chat"> Chat</Nav.Link>
//</LinkContainer>
