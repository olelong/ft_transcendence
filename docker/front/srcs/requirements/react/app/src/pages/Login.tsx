import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_UID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;

export default function Login() {
  const [msg, updateMsg] = useState();

  useEffect(() => {
    fetch("http://127.0.0.1:3001")
      .then((response) => response.json())
      .then((data) => updateMsg(data.msg))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Login</h2>
      <p>msg from server: {msg}</p>
      <Button onClick={() => (window.location.href = authorizationUrl)}>
        Login
      </Button>
    </div>
  );
}
