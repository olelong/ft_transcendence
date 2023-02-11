import { serverUrl } from "index";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Game() {
  const socket = io(`${serverUrl}/game`, {
    withCredentials: true,
  });
  useEffect(() => {
    socket.on("stateChanged", console.log);
    socket.on("error", console.error);
  }, [socket]);
  return <div>Game</div>;
}
