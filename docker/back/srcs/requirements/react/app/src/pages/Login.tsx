import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { Image, Row, Col, Button, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { LS_KEY_42API, LS_KEY_LOGIN, COOKIE_KEY } from "../utils/auth";
import ClassicLogin from "../components/ClassicLogin";
import LoginTfa from "../components/LoginTfa";

import "../styles/Login.css";
import logo from "../assets/main/logoWithoutBg.png";
import { useNavigate } from "react-router-dom";

const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_UID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;

export default function Login() {
  const [tfaValid, setTfaValid] = useState<boolean | null>(null);
  const [loginWithTfa, setLoginWithTfa] = useState<(tfaCode: string) => void>();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem(LS_KEY_42API);
    localStorage.removeItem(LS_KEY_LOGIN);
    Cookies.remove(COOKIE_KEY);
  }, []);

  useEffect(() => {
    if (tfaValid === true) window.location.href = "/home/play";
  }, [tfaValid, navigate]);

  return !loginWithTfa ? (
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
            <ClassicLogin
              setLoginWithTfa={setLoginWithTfa}
              setTfaValid={setTfaValid}
            />
          </div>
        </Col>
      </Row>
    </Container>
  ) : (
    <LoginTfa
      tfaValid={tfaValid}
      setTfaValid={setTfaValid}
      loginWithTfa={loginWithTfa}
    />
  );
}
