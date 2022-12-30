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
    <div className="container"> 
    {/** <p>msg from server: {msg}</p> */}      
      <div className="row">
        <div>
          <div className="bg-image d-flex justify-content-center align-items-center">
          {/**Card  */}
          <div>
          <h1 className="display-2">cat pong</h1>
        <a href="/home/play" className="btn btn-outline-light btn-lg">Login</a>
          </div>
          </div>
        </div>
      </div>
      </div>

      
  );
}
