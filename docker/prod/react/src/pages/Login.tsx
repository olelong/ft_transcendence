import { Image, Row, Col, Button, Container } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";
import logo from "../assets/main/logoWithoutBg.png";

import { LS_KEY_42API, COOKIE_KEY } from "utils/auth";
import Cookies from "js-cookie";

const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_UID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;

export default function Login() {
  localStorage.removeItem(LS_KEY_42API);
  Cookies.remove(COOKIE_KEY);
  
  return (
    <Container className="login-container">
      <Row className="align-items-center">
        <Col xs={12} md={8}>
          <Image className="myImg" src={logo} alt="Logo image" fluid />
          <div>
            <Button
              onClick={() => (window.location.href = authorizationUrl)}
              className="btn-outline-light btn-lg login-btn"
            >
              Login
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
