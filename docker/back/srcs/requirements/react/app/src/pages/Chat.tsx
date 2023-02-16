import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../components/Header";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function Chat() {
  const chatSocket = useContext(SocketContext);
  const [challengeTo, setChallengeTo] = useState("");
  const [challengeFrom, setChallengeFrom] = useState("");
  const [popupShow, setPopupShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    chatSocket.on("challenge", (data) => {
      if (data.info === "new") {
        setChallengeFrom(data.opponentName);
        setPopupShow(true);
      }
      if (data.info === "accepted") navigate("/home/game");
      console.log(data);
    });
    chatSocket.on("watcherUpdate", console.log);
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
      <input
        type="text"
        value={challengeTo}
        onChange={(e) => setChallengeTo(e.target.value)}
      />
      <Button
        onClick={() => {
          chatSocket.emit("challenge", {
            action: "send",
            opponentName: challengeTo,
          });
        }}
      >
        Send Challenge
      </Button>
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
