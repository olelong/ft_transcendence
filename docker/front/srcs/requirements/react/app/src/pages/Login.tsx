import { useState } from "react";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import "bootstrap/dist/css/bootstrap.min.css";

import "../styles/Login.css";
import logo from "../assets/main/logoWithoutBg.png";

export default function Login() {
  const [msg, updateMsg] = useState();

  fetch("http://127.0.0.1:3001")
    .then((response) => response.json())
    .then((data) => updateMsg(data.msg))
    .catch((err) => console.error(err));

  return (
    <Container>
      {/** <p>msg from server: {msg}</p> */}
      <Row>
        <div className="bg-image d-flex justify-content-center align-items-center">
          {/**Card  */}
          <div>
            <img src={logo} alt="logo" />
            <br />
            <Button className="btn-outline-light btn-lg my-btn">Login</Button>
          </div>
        </div>
      </Row>
    </Container>
  );
}
