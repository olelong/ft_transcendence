import { Link, Outlet } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/header.css'

import logo from '../assets/main/pictoGrand.png';


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
      <Link className="profile" to="/home/profile">Profile</Link>
      <Link className="play" to="/home/play">Play</Link>
      <Link className="chat" to="/home/chat">Chat</Link>
      </Navbar>
      <Outlet />
    </div>
  );
}
