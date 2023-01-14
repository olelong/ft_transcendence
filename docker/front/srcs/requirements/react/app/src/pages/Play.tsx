import { Button, Col, Container, Row, Image } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Play.css";
import UserImg from "../assets/main/circle_tabby.png";

const playUrl = `localhost:3000/home/chat`;

export default function Play() {
  return (
    <Container>
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={8}>
          <Image className="UserImg" src={UserImg} alt="User image" fluid />
          <div>
            <Button
              onClick={() => (window.location.href = playUrl)}
              className="btn-outline-light btn-lg play-btn"
            >
              Play
            </Button>
          </div>
        </Col>
        {/** Second col to display the friends */}
        <Col></Col>
      </Row>
    </Container>
  );
}
