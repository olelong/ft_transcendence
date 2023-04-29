import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import { GoEye } from "react-icons/go";

import { serverUrl } from "../index";
import { LoginContext, SocketContext } from "../components/Header";
import CatPongImage from "../components/CatPongImage";
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

  const [userPaddle, setUserPaddle] = useState(-1); // in px

  // ball and wall collison. Ball should not depasser le board

  // set the image per game theme par defaut, J'ai mis "galaxy" par defaut pour tester
  const [imgs, setImgs] = useState<ThemeImages>();

  const [socket, setSocket] = useState<Socket>();
  const [config, setConfig] = useState<GameInitEvData["config"]>();
  const [players, setPlayers] = useState<[User, User]>();
  const [myIdx, setMyIdx] = useState<number>();
  const [state, setState] = useState<GameState>();
  const [role, setRole] = useState<"player" | "watcher" | "player-watcher">(
    "watcher"
  );
  const [showPlayerWatcherText, setShowPlayerWatcherText] = useState(false);
  const [playAgainText, setPlayAgainText] = useState<string | undefined>(
    "Play Again"
  );

  const { chatSocket, setInGame } = useContext(SocketContext);
  const login = useContext(LoginContext);
  const ball = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const size = useWindowSize();

  /// Manage the game socket
  // Connection
  useEffect(() => {
    const newSocket = io(serverUrl + "/game", { withCredentials: true });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
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
      console.error(data);
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

  // Get theme
  useEffect(() => {
    fetch(serverUrl + "/user/profile", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => setImgs(getThemeImages(data.theme)))
      .catch(console.error);
  }, []);

  //** Check if players are already friend or not. If they're not friend, "add friend" button should be appeared */
  useEffect(() => {
    if (players && !playersFriendship) {
      const getFriendship = async () =>
        (await Promise.all(
          players.map(async (player) => {
            if (player.id === login) return true;
            const res = await fetch(serverUrl + "/user/friends/" + player.id, {
              credentials: "include",
            });
            const data = await res.json();
            return data.ok as boolean;
          })
        )) as [boolean, boolean];
      getFriendship().then((friendship) => setPlayersFriendship(friendship));
    }
  }, [players, playersFriendship, login]);

  //CurrentConfigTopx : communicate with back
  useEffect(() => {
    if (watchContainer.current && config && imgs) {
      const currentConfigToPx =
        watchContainer.current.offsetWidth / config.canvas.width;
      setConfigToPx(currentConfigToPx);
      const newHeight = config.canvas.height * currentConfigToPx;
      watchContainer.current.style.height = newHeight + "px";
    }
  }, [watchContainer, size, config, imgs]);

  useEffect(() => {
    function onMatchMaking(data: MatchmakingEvData) {
      chatSocket?.emit(
        "game-room",
        { join: true, roomId: data.gameId },
        (success: boolean) => {
          if (success) {
            setInGame(true);
            window.location.reload();
          }
        }
      );
    }
    chatSocket?.on("matchmaking", onMatchMaking);

    return () => {
      chatSocket?.emit("matchmaking", { join: false });
      chatSocket?.off("matchmaking", onMatchMaking);
    };
  }, [chatSocket, navigate, setInGame]);

  // Spin the ball
  useEffect(() => {
    const ballNode = ball.current;
    let interval: NodeJS.Timer;
    if (!state?.pauseMsg) {
      let rotation = 0;
      interval = setInterval(() => {
        rotation += 10;
        if (ballNode) ballNode.style.transform = `rotate(${rotation}deg)`;
      }, 30);
    }

    return () => {
      if (ballNode) ballNode.style.transform = `rotate(${0}deg)`;
      clearInterval(interval);
    };
  }, [state?.pauseMsg]);

  return config && players && state && myIdx !== undefined && imgs ? (
    <Container className="all-container">
      {/**Players div */}
      <div className="gamewatch-firstdiv">
        {players &&
          playersFriendship &&
          (myIdx === 0 ? players : [...players].reverse()).map(
            (eachPlayer: User, i) => {
              return (
                <div className="players-container" key={eachPlayer.id}>
                  <CatPongImage
                    className="players-img"
                    user={eachPlayer}
                  ></CatPongImage>
                  <h3 className="players-id">{eachPlayer.name}</h3>
                  {playersFriendship[myIdx === 0 ? i : i ^ 1] || (
                    <Button
                      className="addfriend-btn dark-purple-button"
                      style={{ borderRadius: "12px" }}
                      onClick={() => {
                        setPlayersFriendship((fs) => {
                          if (!fs) return fs;
                          fs[myIdx === 0 ? i : i ^ 1] = true;
                          return fs;
                        });
                        fetch(serverUrl + "/user/friends/" + eachPlayer.id, {
                          credentials: "include",
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ add: true }),
                        });
                      }}
                    >
                      <img
                        className="addfriend-img"
                        src={addfriendImg}
                        alt="addFriend-img"
                      ></img>
                    </Button>
                  )}
                </div>
              );
            }
          )}
      </div>
      {/**Score  Second container*/}
      <div className="score-container">
        <h1>
          {state.scores[myIdx]} : {state.scores[myIdx ^ 1]}
        </h1>
        {state.watchers > 0 && (
          <div className="watchers-container">
            <h3 className="watchers-number">{state.watchers}</h3>
            <GoEye size={22} />
          </div>
        )}
        {/* {players.length == 2 && <h2 className="score-title">10-2</h2>} */}
      </div>

      {/**Game container */}
      <div className="group-container">
        {/* <div className="d-flex mx-auto w-100"> */}
        <div
          className="watch-container"
          ref={watchContainer}
          style={{
            backgroundImage: `url(${imgs.map})`,
            cursor: showPlayerWatcherText ? "not-allowed" : "auto",
          }}
          onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (state.ended) return;
            setShowPlayerWatcherText(role === "player-watcher");
            const rect = e.currentTarget.getBoundingClientRect();
            let currPos =
              e.clientY - rect.top - (config.paddle.height / 2) * configToPx;
            if (currPos < 0) currPos = 0;
            const maxCurrPos =
              (config.canvas.height - config.paddle.height) * configToPx;
            if (currPos > maxCurrPos) currPos = maxCurrPos;
            if (role === "player") setUserPaddle(currPos);
            // Send paddle pos to server
            if (role !== "watcher")
              socket?.emit(
                "update",
                {
                  paddlePos: currPos / configToPx + config.paddle.height / 2,
                },
                (success: boolean) => {
                  if (success) setRole("player");
                }
              );
          }}
          onMouseOut={() => {
            setShowPlayerWatcherText(false);
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
            {players &&
              (myIdx === 0 ? players : [...players].reverse()).map(
                (eachPlayer: User) => {
                  return (
                    <div
                      className="players-mobile-container"
                      key={eachPlayer.id}
                    >
                      <div className="mobile-players-container">
                        <CatPongImage
                          className="players-mobile-img"
                          user={eachPlayer}
                        ></CatPongImage>
                        <p className="players-mobile-id">{eachPlayer.name}</p>
                      </div>
                    </div>
                  );
                }
              )}

            <div className="mobile-score-container">
              <h1>
                {state.scores[myIdx]} : {state.scores[myIdx ^ 1]}
              </h1>
              {state.watchers > 0 && (
                <div className="watchers-container">
                  <h3 className="watchers-number">{state.watchers}</h3>
                  <GoEye size={22} />
                </div>
              )}
            </div>
          </div>
          {/* <img className="pong-background" src={pongbackgroundImg}           style={{
            width: config.canvas.width * configToPx,
            height: config.canvas.height * configToPx,
          }}></img> */}
          {/* Display paddle image */}
          <img
            className="left-paddle"
            src={imgs.paddle}
            alt="Left paddle"
            style={{
              width: config.paddle.width * configToPx,
              height: config.paddle.height * configToPx,
              position: "absolute",
              left: 0,
              top:
                role === "player" && userPaddle !== -1
                  ? userPaddle
                  : (state.paddles[myIdx] - config.paddle.height / 2) *
                    configToPx,
            }}
          />
          {showPlayerWatcherText && (
            <p className="player-watcher-text">
              Another window of this game is opened, you can just watch the game
              here
            </p>
          )}
          {!isNaN(parseInt(state.pauseMsg || "")) && (
            <h2 className="counter-text">{state.pauseMsg}</h2>
          )}
          {state.ended && (
            <h4 className="victory-text">
              🎉 {getWinnerName(players, state.scores)} won! 🎉
            </h4>
          )}
          {state.ended && role === "player" && (
            <Button
              className="dark-purple-button playagain-button"
              onClick={() => {
                setPlayAgainText(undefined);
                if (playAgainText === "Play Again")
                  chatSocket?.emit(
                    "matchmaking",
                    { join: true },
                    (success: boolean) => {
                      if (success) setPlayAgainText("Matchmaking...");
                    }
                  );
                else if (playAgainText === "Matchmaking...")
                  chatSocket?.emit(
                    "matchmaking",
                    { join: false },
                    (success: boolean) => {
                      if (success) setPlayAgainText("Play Again");
                    }
                  );
              }}
            >
              {chatSocket && playAgainText ? playAgainText : <Spinner />}
            </Button>
          )}
          <img
            src={imgs.ball}
            alt="ball"
            ref={ball}
            style={{
              width: config.ballRadius * configToPx,
              height: config.ballRadius * configToPx,
              position: "absolute",
              left:
                ((myIdx === 0
                  ? state.ball.x
                  : -state.ball.x + config.canvas.width) -
                  config.ballRadius / 2) *
                configToPx,
              top: (state.ball.y - config.ballRadius / 2) * configToPx,
            }}
          />
          <img
            className="right-paddle"
            src={imgs.paddle}
            alt="Right paddle"
            style={{
              width: config.paddle.width * configToPx,
              height: config.paddle.height * configToPx,
              position: "absolute",
              right: 0,
              top:
                (state.paddles[myIdx ^ 1] - config.paddle.height / 2) *
                configToPx,
            }}
          />
        </div>
      </div>
      {role === "watcher" && chatSocket && (
        <Button
          className="dark-purple-button"
          style={{ marginTop: 20 }}
          onClick={() => {
            chatSocket.emit("game-room", { join: false });
            setInGame(false);
            navigate("/home/play");
          }}
        >
          Quit Game
        </Button>
      )}
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
        paddle: paddleImg,
        ball: ballImg,
        map: mapImg,
      };
    } else if (theme === "archeonic") {
      return {
        paddle: archeonicPaddleImg,
        ball: archeonicBallImg,
        map: archeonicMapImg,
      };
    } else if (theme === "galactic") {
      return {
        paddle: galacticPaddleImg,
        ball: galacticBallImg,
        map: galacticMapImg,
      };
    }
  } catch (error) {
    console.error("error to display===>", error);
  }
  // if user don't choose, default img is classic
  return {
    paddle: "",
    ball: "",
    map: "",
  };
}

function getWinnerName(
  players: [User, User],
  scores: [number, number]
): string {
  let idx: number;
  if (scores[0] > scores[1]) idx = 0;
  else idx = 1;
  return players[idx].name;
}
