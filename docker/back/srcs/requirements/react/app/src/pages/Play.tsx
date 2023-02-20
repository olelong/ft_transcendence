import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Row, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { SocketContext } from "../components/Header";
import "../styles/Play.css";
import UserImg from "../assets/main/circle_tabby.png";

export default function Play() {
  const { chatSocket, inGame, setInGame } = useContext(SocketContext);
  const [buttonText, setButtonText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setButtonText(!inGame ? "Play" : "Join Current Room");
  }, [inGame]);

  useEffect(() => {
    chatSocket.on("matchmaking", (data) => {
      chatSocket.emit(
        "gameRoomAccess",
        { join: true, roomId: data.gameId },
        (success: boolean) => {
          if (success) {
            setInGame(true);
            navigate("/home/game");
          }
        }
      );
    });

    return () => {
      chatSocket.emit("matchmaking", { join: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="play-container">
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          <div>
            <Image className="UserImg" src={UserImg} alt="User image" fluid />
            <br />
            <Button
              className="btn-outline-light btn-lg play-btn"
              onClick={() => {
                if (inGame) navigate("/home/game");
                else if (buttonText === "Play")
                  chatSocket.emit(
                    "matchmaking",
                    { join: true },
                    (success: boolean) => {
                      if (success) setButtonText("Matchmaking...");
                    }
                  );
                else if (buttonText === "Matchmaking...")
                  chatSocket.emit(
                    "matchmaking",
                    { join: false },
                    (success: boolean) => {
                      if (success) setButtonText("Play");
                    }
                  );
              }}
            >
              {buttonText}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
