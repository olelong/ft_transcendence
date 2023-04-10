import { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Col, Container, Row, Image, Spinner } from "react-bootstrap";
import { RxCross2 } from "react-icons/rx";

import CatPongImage from "../components/CatPongImage";
import { serverUrl } from "index";
import { SocketContext } from "../components/Header";

import EyeImg from "../assets/icons/eye2.png";
import trophyImg from "../assets/podium/trophee.png";
import "../styles/Play.css";

export default function Play() {
  const { chatSocket, inGame, setInGame } = useContext(SocketContext);
  const [buttonText, setButtonText] = useState("");
  const [friends, setFriends] = useState<User[]>([]);
  const [friendsPlaying, setFriendsPlaying] = useState<UserSocket[]>([]);
  const [user, setUser] = useState();
  const [showDiv, setShowDiv] = useState(false);
  const [winnerAvatar, setWinnerAvatar] = useState([]);
  const navigate = useNavigate();

  // Manage socket stuff
  useEffect(() => {
    setButtonText(!inGame ? "PLAY" : "Join Current Room");
  }, [inGame]);

  useEffect(() => {
    function onMatchMaking(data: MatchmakingEvData) {
      chatSocket?.emit(
        "game-room",
        { join: true, roomId: data.gameId },
        (success: boolean) => {
          if (success) {
            setInGame(true);
            navigate("/home/game");
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

  useEffect(() => {
    function onUserStatus(user: UserStatusEvData) {
      if (user.status === "ingame") {
        if (!friendsPlaying.some((f) => f.id === user.id)) {
          const friend = friends.find((f) => f.id === user.id);
          if (!friend) return;
          setFriendsPlaying((friendsPlaying) => {
            friendsPlaying.unshift(friend);
            return friendsPlaying;
          });
        }
      } else {
        const friendI = friendsPlaying.findIndex((f) => f.id === user.id);
        if (friendI === -1) return;
        setFriendsPlaying((friendsPlaying) => {
          friendsPlaying.splice(friendI, 1);
          return friendsPlaying;
        });
      }
    }

    chatSocket?.emit("user:status", { users: friends });
    chatSocket?.on("user:status", onUserStatus);

    return () => {
      chatSocket?.off("user:status", onUserStatus);
    };
  }, [chatSocket, friends, friendsPlaying]);

  // Manage horizontal scroll
  const scrollContainer = useRef<HTMLDivElement>(null);

  const handleButtonClick = () => {
    setShowDiv(!showDiv);
  };

  useEffect(() => {
    fetch(serverUrl + "/user/profile", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => setUser(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(serverUrl + "/user/friends", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => setFriends(data.friends))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(serverUrl + "/game/leaderboard", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => setWinnerAvatar(data.users))
      .catch(console.error);
  }, []);

  return (
    <>
      {user && (
        <Container className="play-container">
          <Row>
            {/** First col to display the UserImg and button  */}
            <Col xs={12} md={12}>
              <CatPongImage user={user} className="user-avatar" />
              <br />
              <Button
                className="btn-outline-light btn-lg play-btn"
                onClick={() => {
                  if (inGame) navigate("/home/game");
                  else if (buttonText === "PLAY")
                    chatSocket?.emit(
                      "matchmaking",
                      { join: true },
                      (success: boolean) => {
                        if (success) setButtonText("Matchmaking...");
                      }
                    );
                  else if (buttonText === "Matchmaking...")
                    chatSocket?.emit(
                      "matchmaking",
                      { join: false },
                      (success: boolean) => {
                        if (success) setButtonText("PLAY");
                      }
                    );
                }}
              >
                {chatSocket ? buttonText : <Spinner />}
              </Button>
            </Col>
            {/* Second col to display the friends */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                overflowX: "hidden",
                overflowY: "hidden",
                paddingBottom: 50,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {<h3 className="friends-title">Friends playing</h3>}
                {/* When no friend is playing , need to display the leaderboard */}

                <Row
                  className="friends-row"
                  ref={scrollContainer}
                  onWheel={(e) => {
                    e.preventDefault();
                    if (scrollContainer.current)
                      scrollContainer.current.scrollLeft += e.deltaY;
                  }}
                  style={{
                    ...{
                      paddingLeft: 10,
                      paddingRight: 20,
                    },
                    ...(friendsPlaying.length > 0
                      ? {
                          flexDirection:
                            friendsPlaying.length < 8 ? "row" : "column",
                          height: friendsPlaying.length < 8 ? "40%" : "8vh",
                          marginBottom: 10,
                        }
                      : {
                          height: 100,
                          marginRight: 2,
                        }),
                  }}
                >
                  {/**height length is concerned for the scroll bar */}
                  {/* loop for display the users */}
                  {friendsPlaying.map((eachFriend: UserSocket, i) => {
                    return (
                      <div className="friend-image-container" key={i}>
                        <Image
                          className="gamers-img"
                          src={eachFriend.avatar}
                          alt="User image"
                        />
                        <Link
                          to={"/home/game/" + eachFriend.gameid}
                          style={{ padding: 0 }}
                        >
                          <Image
                            className="eyes"
                            src={EyeImg}
                            alt="eye-image"
                            fluid
                          />
                        </Link>
                      </div>
                    );
                  })}
                </Row>
              </div>
              {/* For leaderboard, trophy */}
              <Row className="trophy-row" xs={12} md={12}>
                <Col className="trophy-column" xs={12} md={4} lg={2}>
                  <button className="trophy-button" onClick={handleButtonClick}>
                    {showDiv ? (
                      showDiv && <RxCross2 size={42} className="x-img" />
                    ) : (
                      <img
                        src={trophyImg}
                        alt="trophy"
                        className="trophy-img"
                      />
                    )}
                  </button>
                  {showDiv && (
                    <div className="showDiv">
                      <h2 className="podium-title">Leaderboard</h2>
                      <Row>
                        {/* display the winners */}
                        {winnerAvatar
                          .filter((_, i) => i < 3)
                          .map((eachWinner: User, i) => {
                            return (
                              <Col key={eachWinner.id} xs={12} md={4} lg={2}>
                                <div className={`winner-col winner-col-${i}`}>
                                  <CatPongImage
                                    user={eachWinner}
                                    className="winners-img"
                                    onClick={() =>
                                      navigate(`/home/profile/${eachWinner.id}`)
                                    }
                                  />
                                </div>

                                {/** */}
                              </Col>
                            );
                          })}
                      </Row>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </Row>
        </Container>
      )}
    </>
  );
}
