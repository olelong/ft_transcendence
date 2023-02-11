import { serverUrl } from "index";
import { Button, Col, Container, Row, Image } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Game.css";

import addfriendImg from "../assets/icons/add_friend.png";

export default function Game() {
  const [players, setPlayer] = useState([]);

  useEffect(() => {
    fetch(serverUrl + "game", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPlayer(data.users))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Container className="all-container">
      <h1>Hello, this is a Game page </h1>

      {/**Players div */}
      <div className="gamewatch-firstdiv">
        {players.length == 2 &&
          players.map((eachPlayer: UserInfosProvider) => {
            return (
              <div className="players-container">
                <Image
                  className="players-img"
                  src={eachPlayer.avatar}
                  alt="EachPlayer image"
                ></Image>
                <h3 className="players-id">{eachPlayer.id}</h3>
              </div>
            );
          })}
            {/**Button add friend */}
          {players.filter((_, i) => i == 1) && 
          <div className="addfriend-container">
            <button className="addfriend">
            <img className="addfriend-img" src= {addfriendImg}alt="addFriend-img">
            </img>
            </button>
            </div>
          }
        {players.length != 2 && <h2> Players should be two! </h2>}
      </div>
      {/**Score  Second container*/}
      <div className="score-container">
        {players.length == 2 && (
          <h2 className="score-title"> This is score 10 :2 </h2>
        )}
      </div>

      {/**Game watch container */}
      <div className="d-flex mx-auto w-100">
      <div className="watch-container"></div>
      </div>
    </Container>
  );
}
