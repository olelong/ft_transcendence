import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";

import { serverUrl } from "../index";
import { SocketContext } from "../components/Header";
import useWindowSize from "../utils/useWindowSize";

import addfriendImg from "../assets/icons/add_friend.png";
import catLoad from "../assets/main/cat-load.gif";
import "../styles/Game.css";
// default map - classic
import paddleImg from "../assets/ping/barre.png";
import ballImg from "../assets/ping/circle.png";
import mapImg from "../assets/ping/classic.jpg";
// // map theme : archeonic
import archeonicPaddleImg from "../assets/theme/Archeonic_paddle.png";
import archeonicBallImg from "../assets/theme/Archeonic_ball.png";
import archeonicMapImg from "../assets/theme/Archeonic_map.jpg";
// map theme : galactic
import galacticPaddleImg from "../assets/theme/Galactic_paddle.png";
import galacticBallImg from "../assets/theme/Galactic_ball.png";
import galacticMapImg from "../assets/theme/Galactic_map.jpg";

// range y paddle : min: 0.125 max: 0.875

export default function Game() {
  const [playersFriendship, setPlayersFriendship] =
    useState<[boolean, boolean]>();
  const watchContainer = useRef<HTMLDivElement>(null);

  // configToPx est un facteur qui permet de modifier les unites
  // du back en pixels, il est set automatiquement a chaque fois
  // que la window est resize donc pas besoin de penser au responsive!
  const [configToPx, setConfigToPx] = useState(0);

  const [userPaddle, setUserPaddle] = useState(0); // in px

  // ball and wall collison. Ball should not depasser le board

  // set the image per game theme par defaut, J'ai mis "galaxy" par defaut pour tester
  const [theme, setTheme] = useState("galaxy");
  const { paddleImg, ballImg, mapImg } = getThemeImages(theme);

  const [socket, setSocket] = useState<Socket>();
  const [config, setConfig] = useState<GameInitEvData["config"]>();
  const [players, setPlayers] = useState<[User, User]>();
  const [myIdx, setMyIdx] = useState<number>();
  const [state, setState] = useState<GameState>();
  const [role, setRole] = useState<"player" | "watcher" | "player-watcher">(
    "watcher"
  );

  const { chatSocket, setInGame } = useContext(SocketContext);
  const navigate = useNavigate();
  const size = useWindowSize();

  /// Manage the game socket
  // Connection
  useEffect(() => {
    setSocket(io(serverUrl + "/game", { withCredentials: true }));
    return () => {
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listening events
  useEffect(() => {
    function onInit(data: GameInitEvData) {
      setConfig(data.config);
      setPlayers(data.players);
      setState(data.state);
      setInGame(true);
      if (data.idx !== undefined) {
        setMyIdx(data.idx);
        setRole("player");
      } else setMyIdx(0);
    }
    function onUpdate(state: GameState) {
      if (state.ended) setInGame(false);
      setState(state);
    }
    function onError(data: NetError) {
      if (data.origin.event !== "update") console.error(data);
      if (data.origin.event === "connection") {
        setInGame(false);
        navigate("/home/play");
      }
      if (data.origin.event === "update" && role === "player")
        setRole("player-watcher");
    }

    socket?.on("init", onInit);
    socket?.on("update", onUpdate);
    socket?.on("error", onError);

    return () => {
      socket?.off("init", onInit);
      socket?.off("update", onUpdate);
      socket?.off("error", onError);
    };
  }, [navigate, role, setInGame, socket]);

  //** Check if players are already friend or not. If they're not friend, "add friend" button should be appeared */
  useEffect(() => {
    if (players && !playersFriendship) {
      const setFriendship = async () =>
        await Promise.all(
          players.map(async (player: { id: string }, i) => {
            const res = await fetch(serverUrl + "/user/friends/" + player.id, {
              credentials: "include",
            });
            const data = await res.json();
            const friendShipCp: [boolean, boolean] = playersFriendship
              ? [...playersFriendship]
              : [true, true];
            friendShipCp[i] = data.ok;
            console.log(data.ok);
            setPlayersFriendship(friendShipCp);
          })
        );
      setFriendship();
    }
  }, [players, playersFriendship]);

  //CurrentConfigTopx : communicate with back
  useEffect(() => {
    if (watchContainer.current && config) {
      const currentConfigToPx =
        watchContainer.current.offsetWidth / config.canvas.width;
      setConfigToPx(currentConfigToPx);
      const newHeight = config.canvas.height * currentConfigToPx;
      watchContainer.current.style.height = newHeight + "px";
    }
  }, [watchContainer, size, config]);

  console.log(state?.ball.x);

  return config && players && state && myIdx !== undefined ? (
    <Container className="all-container">
      {/**Test for game map */}
      <div>
        <h2>Yooyoo Map test</h2>
        <button onClick={() => setTheme("classic")}>Classic</button>
        <button onClick={() => setTheme("archeonic")}>Archeonic</button>
        <button onClick={() => setTheme("galaxy")}>Galaxy</button>
      </div>
      {/**Players div */}
      <div className="gamewatch-firstdiv">
        {players &&
          playersFriendship &&
          players.map((eachPlayer: User, i) => {
            return (
              <div className="players-container">
                {playersFriendship[i] || (
                  <Button className="addfriend-btn">
                    <img
                      className="addfriend-img"
                      src={addfriendImg}
                      alt="addFriend-img"
                    ></img>
                  </Button>
                )}
                <Image
                  className="players-img"
                  src={serverUrl + eachPlayer.avatar}
                  alt="EachPlayer image"
                ></Image>
                <h3 className="players-id">{eachPlayer.name}</h3>
              </div>
            );
          })}
      </div>
      {/**Score  Second container*/}
      <div className="score-container">
        <h1>
          {state.scores[myIdx]} : {state.scores[myIdx ^ 1]}
        </h1>
        {state.ended && (
          <Button className="playagain-button">Play Again</Button>
        )}
        {/* {players.length == 2 && <h2 className="score-title">10-2</h2>} */}
      </div>

      {/**Game container */}
      <div className="group-container">
        {/* <div className="d-flex mx-auto w-100"> */}
        <div
          className="watch-container"
          ref={watchContainer}
          style={{ backgroundImage: `url(${mapImg})` }}
          onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const currPos =
              e.clientY - rect.top - (config.paddle.height / 2) * configToPx;
            if (currPos < 0) return;
            if (
              currPos >
              (config.canvas.height - config.paddle.height) * configToPx
            )
              return;
            if (role === "player") setUserPaddle(currPos);
            // Send paddle pos to server
            socket?.emit(
              "update",
              { paddlePos: currPos / configToPx },
              (success: boolean) => {
                if (success) setRole("player");
              }
            );
          }}
          onMouseOut={() => {
            const y = userPaddle / configToPx;
            const trigger = 0.15;
            if (y < config.canvas.height * trigger) setUserPaddle(0);
            if (y + config.paddle.height > config.canvas.height * (1 - trigger))
              setUserPaddle(
                (config.canvas.height - config.paddle.height) * configToPx
              );
          }}
        >
          {/** Mobile version tabby and tabby lover */}
          <div
            className="gamewatch-mobile-div"
            style={
              {
                // width: config.canvas.height * configToPx,
              }
            }
          >
            {players.length === 2 &&
              players.map((eachPlayer: User) => {
                return (
                  <div className="players-mobile-container">
                    <div className="mobile-players-container">
                      <Image
                        className="players-mobile-img"
                        src={serverUrl + eachPlayer.avatar}
                        alt="EachPlayer image"
                      ></Image>
                      <p className="players-mobile-id">{eachPlayer.name}</p>
                    </div>
                  </div>
                );
              })}
            {players.length !== 2 && <h2> Players should be two! </h2>}
          </div>
          {/* <img className="pong-background" src={pongbackgroundImg}           style={{
            width: config.canvas.width * configToPx,
            height: config.canvas.height * configToPx,
          }}></img> */}
          {/* Display paddle image */}
          <img
            className="right-paddle"
            src={paddleImg}
            alt="Right paddle"
            style={{
              width: config.paddle.width * configToPx,
              height: config.paddle.height * configToPx,
              left:
                ((config.canvas.width + config.ballRadius) / 2) * configToPx,
              top: state.paddles[myIdx ^ 1] * configToPx,
            }}
          />
          <img
            className="left-paddle"
            src={paddleImg}
            alt="Left paddle"
            style={{
              width: config.paddle.width * configToPx,
              height: config.paddle.height * configToPx,
              right:
                ((config.canvas.width - config.ballRadius) / 2) * configToPx,
              top:
                role === "player"
                  ? userPaddle
                  : state.paddles[myIdx] * configToPx,
            }}
          />
          <img
            src={ballImg}
            alt="ball"
            style={{
              width: config.ballRadius * configToPx,
              height: config.ballRadius * configToPx,
              position: "relative",
              right: `${state.ball.x * configToPx}px`,
              top: `${state.ball.y * configToPx}px`,
            }}
          />
        </div>
      </div>
    </Container>
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

// function to display the image
function getThemeImages(theme: string): ThemeImages {
  try {
    if (theme === "classic") {
      return {
        paddleImg,
        ballImg,
        mapImg,
      };
    } else if (theme === "archeonic") {
      return {
        paddleImg: archeonicPaddleImg,
        ballImg: archeonicBallImg,
        mapImg: archeonicMapImg,
      };
    } else if (theme === "galaxy") {
      return {
        paddleImg: galacticPaddleImg,
        ballImg: galacticBallImg,
        mapImg: galacticMapImg,
      };
    }
  } catch (error) {
    console.error("error to display===>", error);
  }
  // if user don't choose, default img is classic
  return {
    paddleImg: "",
    ballImg: "",
    mapImg: "",
  };
}
