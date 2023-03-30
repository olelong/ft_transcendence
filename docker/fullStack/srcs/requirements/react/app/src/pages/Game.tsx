import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Button from "react-bootstrap/Button";

import { serverUrl } from "../index";
import { SocketContext } from "../components/Header";

import catLoad from "../assets/main/cat-load.gif";

export default function Game() {
  const [players, setPlayers] = useState<[string, string]>();
  const [myIdx, setMyIdx] = useState<number>();
  const [state, setState] = useState<GameState>();
  const [controller, setController] = useState<boolean>(); // true => player controls, false => player cannot control, undefined => watcher
  const { chatSocket, setInGame } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    let roleT = "player";
    const socket = io(serverUrl + "/game", { withCredentials: true });

    // Receive
    socket.on("init", (data) => {
      setState(data.state);
      setPlayers(data.players);
      setInGame(true);
      if (data.idx !== undefined) setMyIdx(data.idx);
      else {
        setMyIdx(0);
        roleT = "watcher";
      }
    });
    socket.on("update", (state) => {
      if (state.ended) setInGame(false);
      setState(state);
    });
    socket.on("error", (data: NetError) => {
      if (data.origin.event !== "update") console.error(data);
      if (data.origin.event === "connection") {
        setInGame(false);
        navigate("/home/play");
      }
      if (data.origin.event === "update" && roleT === "player")
        setController(false);
    });

    const interval = setInterval(
      () =>
        socket.emit("update", { paddlePos: 0.2 }, (success: boolean) => {
          if (success) setController(true);
        }),
      200
    );

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return players && myIdx !== undefined && state ? (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "700px",
        }}
      >
        <h2>
          {players[myIdx] + " " + state.scores[myIdx]}-
          {state.scores[myIdx ^ 1] + " " + players[myIdx ^ 1]}
        </h2>
      </div>
      {controller === undefined && myIdx === 0 && chatSocket && (
        <Button
          onClick={() => {
            chatSocket.emit("game-room", { join: false });
            setInGame(false);
            navigate("/home/play");
          }}
        >
          Quit Game
        </Button>
      )}
      {controller === true && <h3>Tu controlles frero</h3>}
      {controller === false && state.ended === false && (
        <h3>
          Another window of this game is opened, you can just watch the game
          here
        </h3>
      )}
      {state.pauseMsg && <h4>Pause: {state.pauseMsg}</h4>}
      <h4>Watchers: {state.watchers}</h4>
    </>
  ) : (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <img src={catLoad} alt="Cat running for Loading" width={200} />
    </div>
  );
}
