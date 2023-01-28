import { useParams } from "react-router-dom";

export default function Game() {
  const { gameId } = useParams();
  if (gameId !== undefined)
    console.log("I'm in watch mode!");
  return <h1>Game page {gameId}</h1>;
}
