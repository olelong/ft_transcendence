import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';


export default function Login() {
  const [msg, updateMsg] = useState();

  fetch("http://127.0.0.1:3001")
    .then((response) => response.json())
    .then((data) => updateMsg(data.msg))
    .catch((err) => console.error(err));

  return (
    <div className="container my-5">
      <div className="bg-image d-flex justify-content-center align-items-center">
      <h1 className="text-white">cat pong</h1>
      </div>
      <p>msg from server: {msg}</p>

      
      <div className="mb-3 h2">
      <Button><Link to="/home/play">Login</Link></Button>
      </div>
    </div>
  );
}
