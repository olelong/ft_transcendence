import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [msg, updateMsg] = useState();

  fetch("http://127.0.0.1:3001")
    .then((response) => response.json())
    .then((data) => updateMsg(data.msg))
    .catch((err) => console.error(err));

  return (
    <div>
      <h2>Login</h2>
      <p>msg from server: {msg}</p>
      <Link to="/home/play">Login</Link>
    </div>
  );
}
