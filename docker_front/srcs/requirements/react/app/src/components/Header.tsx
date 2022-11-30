import { Link, Outlet } from "react-router-dom";

export default function Header() {
  return (
    <div>
      <Link to="/home/profile">Profile</Link>
      <Link to="/home/play">Play</Link>
      <Link to="/home/chat">Chat</Link>
      <Outlet />
    </div>
  );
}
