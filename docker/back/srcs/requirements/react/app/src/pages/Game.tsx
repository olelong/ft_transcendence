import { serverUrl } from "index";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function Game() {
  const [players, setPlayers] = useState<[string, string]>();
  const [myIdx, setMyIdx] = useState<number>();
  const [state, setState] = useState<GameState>();
  const [controller, setController] = useState<boolean>();

  useEffect(() => {
    let roleT = "player";
    const socket = io(`${serverUrl}/game`, {
      withCredentials: true,
    });
    socket.on("initPong", (data) => {
      console.log(data);
      setState(data.state);
      setPlayers(data.players);
      if (data.idx !== undefined) setMyIdx(data.idx);
      else {
        setMyIdx(0);
        roleT = "watcher";
        console.log("watcher");
      }
    });
    socket.on("stateChanged", setState);
    socket.on("error", (data: NetError) => {
      console.error(data);
      if (data.origin.event === "paddlePos" && roleT === "player")
        setController(false);
    });

    const interval = setInterval(
      () =>
        socket.emit("paddlePos", 0.2, (success: boolean) => {
          if (success) setController(true);
        }),
      200
    );

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    console.log("controller:", controller);
  }, [controller]);

  // useEffect(() => {
  //   if (state) console.log(state);
  // }, [state]);

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
      {controller === true && <h3>Tu controlles frero</h3>}
      {controller === false && (
        <h3>
          Another window of this game is opened, you can just watch the game
          here
        </h3>
      )}
      {state.pauseMsg && <h4>Pause: {state.pauseMsg}</h4>}
      <h4>Watchers: {state.watchers}</h4>
    </>
  ) : null;
}
