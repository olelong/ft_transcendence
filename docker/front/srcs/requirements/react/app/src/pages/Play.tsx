import { Button, Col, Container, Row, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Play.css";
import { serverUrl } from "index";
import EyeImg from "../assets/icons/eye2.png";
import trophyImg from "../assets/podium/trophee.png";
import { RxCross2 } from "react-icons/rx";
import { useEffect, useState, useRef} from "react";
import { Link } from "react-router-dom";
export const LS_KEY_42API = "42-tokens";

export default function Play() {
  const [friendsPlaying, setFriendsPlaying] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [showDiv, setShowDiv] = useState(false);
  const [winnerAvatar, setWinnerAvatar] = useState([]);

  // Manage horizontal scroll
  const scrollContainer = useRef<HTMLDivElement>(null);

  const handleButtonClick = () => {
    setShowDiv(!showDiv);
  };

  useEffect(() => {
    fetch(serverUrl + "game/friendsplaying", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setFriendsPlaying(data.users))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch(serverUrl + "game/leaderboard", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setWinnerAvatar(data.users))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(serverUrl + "user/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUserAvatar(data.avatar))
      .catch(console.error);
  }, []);

  return (
    <Container className="play-container">
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          <div className="circle">
            <Image
              className="UserImg"
              src={userAvatar && serverUrl + userAvatar}
              alt="User image"
              fluid
            />
          </div>
          <br />
          <Button
            onClick={() => (window.location.href = "/home/game")}
            className="btn-outline-light btn-lg play-btn"
          >
            PLAY
          </Button>
        </Col>
        {/* Second col to display the friends */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {friendsPlaying.length > 0 && (
              <h3 className="friends-title">Friends playing</h3>
            )}
            {friendsPlaying.length > 0 && (
              <Row
                className="friends-row"
                xs={12}
                md={12}
                lg={12}
                ref={scrollContainer}
                onWheel={(e) => {
                  e.preventDefault();
                  if (scrollContainer.current)
                    scrollContainer.current.scrollLeft += e.deltaY;
                }}
                style={{
                  paddingLeft: 30,
                  flexDirection: friendsPlaying.length < 6 ? "row" : "column",
                  overflowX: friendsPlaying.length < 6 ? "hidden" : "scroll",
                  height: friendsPlaying.length < 6 ? "35%" : "36%",
                }}
              >
                {/* loop for display the users */}
                {friendsPlaying.map((eachFriend: UserInfosProvider) => {
                  return (
                    <div className="friend-image-container">
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
            )}
          </div>
          {/* For leaderboard, trophy */}
          <Row className="trophy-col" xs={12} md={12}>
            <Col className="trophy-column" xs={12} md={4} lg={2}>
              <button className="trophy-button" onClick={handleButtonClick}>
                {showDiv ? (
                  showDiv && <RxCross2 size={42} className="x-img" />
                ) : (
                  <img src={trophyImg} className="trophy-img" />
                )}
              </button>
              {showDiv && (
                <div className="showDiv">
                  <h2 className="podium-title">Leaderboard</h2>
                  <Row>
                    {/* display the winners */}
                    {winnerAvatar
                      .filter((_, i) => i < 3)
                      .map((eachWinner: UserInfosProvider, i) => {
                        return (
                          <Col key={eachWinner.id} xs={12} md={4} lg={2}>
                            <div className={`winner-col winner-col-${i}`}>
                              <Image
                                onClick={() =>
                                  (window.location.href = `/home/profile/${eachWinner.id}`)
                                }
                                className="winners-img"
                                src={eachWinner.avatar}
                                alt="winner image"
                                fluid
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
  );
}
