import { Link, Outlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/header.css'

export default function Header() {
  return (
    <div>
      <h1 className="logoName" >CATPONG</h1>
      <Link to="/home/profile">Profile</Link>
      <Link to="/home/play">Play</Link>
      <Link to="/home/chat">Chat</Link>
      <Outlet />
    </div>
  );
}
