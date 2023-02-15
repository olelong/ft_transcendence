import { serverUrl } from "index";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function Game() {
  const [players, setPlayers] = useState<[string, string]>();
  const [myIdx, setMyIdx] = useState<number>();
  const [state, setState] = useState<GameState>();

  useEffect(() => {
    const socket = io(`${serverUrl}/game`, {
      withCredentials: true,
    });
    socket.on("initPong", (data) => {
      console.log(data);
      setState(data.state);
      setPlayers(data.players);
      if (data.idx) setMyIdx(data.idx);
      else setMyIdx(0);
    });
    socket.on("stateChanged", setState);
    socket.on("error", console.error);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (state) console.log(state);
  }, [state]);

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
      {state.pauseMsg && <h4>Pause: {state.pauseMsg}</h4>}
    </>
  ) : null;
}
