import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Row, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { SocketContext } from "../components/Header";
import "../styles/Play.css";
import UserImg from "../assets/main/circle_tabby.png";

export default function Play() {
  const { inGame } = useContext(SocketContext);
  const navigate = useNavigate();

  return (
    <Container className="play-container">
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          <div>
            <Image className="UserImg" src={UserImg} alt="User image" fluid />
            <br />
            <Button className="btn-outline-light btn-lg play-btn" onClick={() => {
              if (inGame) navigate("/home/game");
            }}>{!inGame ? "Play" : "Join Current Room"}</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
