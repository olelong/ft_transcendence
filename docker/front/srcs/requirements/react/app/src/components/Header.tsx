import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import manage42APILogin from "../utils/auth";

export default function Header() {
  const [login, setLogin] = useState("");

  useEffect(() => {
    if (!login) manage42APILogin(setLogin);
  }, [login]);

  return (
    <div>
      <Link to="/home/profile">Profile</Link>
      <Link to="/home/play">Play</Link>
      <Link to="/home/chat">Chat</Link>
      <p>{login}</p>
      {login ? (
        <Outlet />
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Spinner animation="border" className="loader" />
        </div>
      )}
    </div>
  );
}
