import { Button, Col, Container, Row, Image } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Play.css";
import UserImg from "../assets/main/circle_tabby.png";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { serverUrl } from "index";

export default function Play() {
  useEffect(() => {
    const socket = io("http://localhost:3001", { withCredentials: true });
    socket.emit("message", "bref", (data: any) => {
      console.log(data);
      fetch(serverUrl + "/user/profile", { credentials: "include" })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          socket.emit("message", "bref2leretour", (data: string) =>
            console.log(data)
          );
        })
        .catch((error) => console.error(error));
    });
    socket.on("error", (data: any) => {
      console.error("Error:", data);
    });
  }, []);
  return (
    <Container className="play-container">
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          <div>
            <Image className="UserImg" src={UserImg} alt="User image" fluid />
            <br />
            <Button className="btn-outline-light btn-lg play-btn">Play</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
