import { serverUrl } from "index";
import { Button, Col, Container, Row, Image } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Game.css";
import background from "../assets/main/background.jpg";

import pongbackgroundImg from "../assets/ping/classic.jpg";
import paddleImg from "../assets/ping/barre.png";
import ballImg from "../assets/ping/circle.png";
import addfriendImg from "../assets/icons/add_friend.png";

const config = {
  canvas: {
    width: 2.0,
    height: 1.0,
  },
  paddle: {
    width: 0.05,
    height: 0.25,
  },
  ballRadius: 0.05,
};

// range y paddle : min: 0.125 max: 0.875

export default function Game() {
  const [players, setPlayer] = useState([]);
  const watchContainer = useRef<HTMLDivElement>(null);
  const size = useWindowSize();
  const [count, setCount] = useState(0);

 // Ball movement 
  const positionX = 0.5
  const positionY = 0.5;
  const ballSpeed = 5;

  const [x, setBallX] = useState(positionX);
  const [y, setBallY] = useState(positionY);

  useEffect(() => {
    const interval = setInterval(() => {
      setBallX(x + ballSpeed);
      setBallY(y +ballSpeed);
    }, 10);

    return () => clearInterval(interval);
  }, [x, ballSpeed]);

  // For now, useState(0.5) is fixed
  const [userPaddlePos, setUserPaddlePos] = useState(0.5);
  const [enemyPaddlePos, setEnemyPaddlePos] = useState(0.5);

  // configToPx est un facteur qui permet de modifier les unites
  // du back en pixels, il est set automatiquement a chaque fois
  // que la window est resize donc pas besoin de penser au responsive!
  const [configToPx, setConfigToPx] = useState(0);

  useEffect(() => {
    fetch(serverUrl + "game", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPlayer(data.users))
      .catch((err) => console.error(err));
  }, []);

  //CurrentConfigTopx : communicate with back
  useEffect(() => {
    if (watchContainer.current) {
      const currentConfigToPx =
        watchContainer.current.offsetWidth / config.canvas.width;
      setConfigToPx(currentConfigToPx);
      const newHeight = config.canvas.height * currentConfigToPx;
      const newWidth = config.canvas.width * currentConfigToPx;
      const paddleWidth = config.paddle.width * currentConfigToPx;
      const paddleHeight = config.paddle.height * currentConfigToPx;
      const ballHeight = config.ballRadius * currentConfigToPx;
      watchContainer.current.style.height = newHeight + "px";
    }
  }, [watchContainer, size]);

  return (
    <Container className="all-container">
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>TEST</button>
      <img></img>
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
                <h3 className="players-id">{eachPlayer.name}</h3>
              </div>
            );
          })}
        {/**Button add friend */}
        {players.filter((_, i) => i == 1) && (
          <div className="addfriend-container">
            {/* <button className="addfriend">
              <img
                className="addfriend-img"
                src={addfriendImg}
                alt="addFriend-img"
              ></img>
            </button> */}
          </div>
        )}
        {players.length != 2 && <h2> Players should be two! </h2>}
      </div>
      {/**Score  Second container*/}
      <div className="score-container">
        {players.length == 2 && <h2 className="score-title">10-2</h2>}
      </div>

      {/** Group container for the background color  */}
      {/**Game container */}
      <div className="group-container">
        {/* <div className="d-flex mx-auto w-100"> */}
        <div className="watch-container" ref={watchContainer}>
          {/* <img className="pong-background" src={pongbackgroundImg}           style={{
            width: config.canvas.width * configToPx,
            height: config.canvas.height * configToPx,
          }}></img> */}
          <div>
            {/* Display paddle image */}
            <img
              className="left-paddle"
              src={paddleImg}
              style={{
                width: config.paddle.width * configToPx,
                height: config.paddle.height * configToPx,
                right: userPaddlePos * (configToPx * 1.8),
                top: userPaddlePos * (configToPx / 2),
              }}
            />
            <img
              className="right-paddle"
              src={paddleImg}
              style={{
                width: config.paddle.width * configToPx,
                height: config.paddle.height * configToPx,
                left: userPaddlePos * (configToPx * 1.9),
                top: userPaddlePos * (configToPx / 2),
              }}
            />
            <img
              src={ballImg}
              alt="ball"
              style={{
                width: config.ballRadius * configToPx,
                height: config.ballRadius * configToPx,
                position: "relative",
                right: `${x}px` ,
                top: `${y}px`,
              }}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
