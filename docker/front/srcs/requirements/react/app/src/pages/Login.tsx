import { useEffect, useState } from "react";
import { Image, Row, Col, Button, Container } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";
import logo from "../assets/main/logoWithoutBg.png";

import { serverUrl } from "index";

const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_UID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;

export default function Login() {
  const [msg, updateMsg] = useState();

  useEffect(() => {
    fetch(serverUrl)
      .then((response) => response.json())
      .then((data) => updateMsg(data.msg))
      .catch((err) => console.error(err));

    fetch(serverUrl + "user/friends?id=ytak&num=2")
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Container>
      <Row className="align-items-center">
        <Col xs={12} md={8}>
          <Image className="myImg" src={logo} alt="Logo image" fluid />
          <div> <Button
            onClick={() => (window.location.href = authorizationUrl)}
            className="btn-outline-light btn-lg my-btn"
          >
            Login
          </Button></div>
         
        </Col>
      </Row>
    </Container>
  );
}
