import { Button, Col, Container, Row, Image } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Play.css";
import UserImg from "../assets/main/circle_tabby.png";
import TestImg from "../assets/main/pictoGrand.png";


const playUrl = `localhost:3000/home/chat`;

export default function Play() {
  return (
    <Container className="play-container">
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          
            <div>
              <Image className="UserImg" src={UserImg} alt="User image" fluid /><br/>
              <Button
                onClick={() => (window.location.href = playUrl)}
                className="btn-outline-light btn-lg play-btn"
                >
                Play
              </Button>
            </div>
        </Col>
        {/** Second col to display the friends */}
        <Row xs={12} md={12}>
          <Col xs={12} md={4} lg={2}>
          <Image className="" src={UserImg} alt="User image" fluid />
              <Button className= "gamers-btn">
                Play
              </Button>
          </Col>
          <Col xs={12} md={4} lg={2}>
          <Image className="" src={UserImg} alt="User image" fluid />
              <Button className= "gamers-btn">
                Play
              </Button>
          </Col>
          <Col xs={12} md={4} lg={2}>
          <Image className="" src={UserImg} alt="User image" fluid />
              <Button className= "gamers-btn">
                Play
              </Button>
          </Col>
          <Col xs={12} md={4} lg={2}>
          <Image className="" src={UserImg} alt="User image" fluid />
              <Button className= "gamers-btn">
                Play
              </Button>
          </Col>
          <Col xs={12} md={4} lg={2}>
          <Image className="" src={UserImg} alt="User image" fluid />
              <Button className= "gamers-btn">
                Play
              </Button>
          </Col>
          <Col xs={12} md={4} lg={2}>
          <Image className="" src={UserImg} alt="User image" fluid />
              <Button className= "gamers-btn">
                Play
              </Button>
          </Col>
        </Row>
      </Row>
    </Container>
  );
}
