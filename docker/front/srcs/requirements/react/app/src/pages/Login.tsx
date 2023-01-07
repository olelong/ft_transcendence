import { useState } from "react";
import { Image, Row, Col, Button, Container } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";
import logo from "../assets/main/logoWithoutBg.png";

console.log("salut");

export default function Login() {
  const [msg, updateMsg] = useState();

  fetch("http://127.0.0.1:3001")
    .then((response) => response.json())
    .then((data) => updateMsg(data.msg))
    .catch((err) => console.error(err));

  return (
    <Container>
      <Row className="align-items-center">
        <Col xs={12} md={8}>
          <Image
            className="myImg"
            src={logo}
            alt="Logo image"
            fluid
          />
          <Button className="btn-outline-light btn-lg my-btn">Login</Button>
        </Col>
      </Row>
    </Container>
  );
}
