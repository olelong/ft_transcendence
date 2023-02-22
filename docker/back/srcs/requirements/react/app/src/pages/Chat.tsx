import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { SocketContext } from "../components/Header";
import InGameCheckButton from "../components/InGameCheckButton";

export default function Chat() {
  const { chatSocket, setInGame } = useContext(SocketContext);
  const [challengeTo, setChallengeTo] = useState("");
  const [challengeFrom, setChallengeFrom] = useState("");
  const [popupShow, setPopupShow] = useState(false);
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    chatSocket.on("challenge", (data) => {
      if (data.info === "new") {
        setChallengeFrom(data.opponentName);
        setPopupShow(true);
      }
      if (data.info === "accepted") {
        chatSocket.emit(
          "game-room",
          {
            join: true,
            roomId: data.gameId,
          },
          (success: boolean) => {
            if (success) {
              setInGame(true);
              navigate("/home/game");
            }
          }
        );
      }
      console.log(data);
    });
    chatSocket.on("error", console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acceptChallenge = () => {
    chatSocket.emit("challenge", {
      action: "accept",
      opponentName: challengeFrom,
    });
    setPopupShow(false);
  };
  const declineChallenge = () => {
    chatSocket.emit("challenge", {
      action: "close",
      opponentName: challengeFrom,
    });
    setPopupShow(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "700px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: 150,
          justifyContent: "space-around",
        }}
      >
        <div>
          <input
            type="text"
            value={challengeTo}
            onChange={(e) => setChallengeTo(e.target.value)}
          />
          <InGameCheckButton
            onClick={() => {
              chatSocket.emit("challenge", {
                action: "send",
                opponentName: challengeTo,
              });
            }}
          >
            Send Challenge
          </InGameCheckButton>
        </div>
        <div>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <InGameCheckButton
            onClick={() => {
              chatSocket.emit(
                "game-room",
                {
                  join: true,
                  roomId: room,
                },
                (success: boolean) => {
                  if (success) {
                    setInGame(true);
                    navigate("/home/game");
                  }
                }
              );
            }}
          >
            Join Room
          </InGameCheckButton>
        </div>
      </div>
      <Modal show={popupShow} style={{ color: "black" }}>
        <Modal.Header>
          <Modal.Title>New Challenge!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{challengeFrom} wants to challenge you!</h5>
          <Button onClick={acceptChallenge}>Accept</Button>
          <Button onClick={declineChallenge} variant="danger">
            Decline
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
