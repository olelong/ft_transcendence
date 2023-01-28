import { Button, Col, Container, Row, Image} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Play.css";
import { serverUrl } from "index";

import UserImg from "../assets/main/tabby.png";
import EyeImg from "../assets/icons/eye2.png";
import PodiumImg from "../assets/podium/podium2.png";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
export const LS_KEY_42API = "42-tokens";
const playUrl = `localhost:3000/home/chat`;


export default function Play() {
  const [friendsPlaying, setFriendsPlaying] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [showDiv, setShowDiv] = useState(false);
  const [winnerAvatar, setWinnerAvatar] = useState([]);

  useEffect(() => {
    fetch(serverUrl + "game/friendsplaying", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setFriendsPlaying(data.users))
      .catch((err) => console.error(err));
  }, []);

  useEffect(()=> {
    fetch(serverUrl + "user/profile", { credentials: "include"})
    .then((res)=> res.json())
    .then((data)=> setUserAvatar(data.avatar))
    .catch(console.error);
  }, []);


  useEffect(()=> {
    fetch(serverUrl + "game/leaderboard", { credentials: "include"})
    .then((res) => res.json())
    .then((data)=> setWinnerAvatar(data.avatar))
    .catch(console.error);
  }, []);


  return (
    <Container className="play-container">
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          <div>
            <Image className="UserImg" src={userAvatar && serverUrl + userAvatar} alt="User image" fluid/>
            <br />
            <Button
              onClick={() => (window.location.href = playUrl)}
              className="btn-outline-light btn-lg play-btn"
            >
              PLAY
            </Button>
            
            <h3 className="friends-title">Friends playing</h3>
          </div>
        </Col>
        {/** Second col to display the friends */}
        <Row className="friends-row"xs={12} md={12}>

          {/** loop for display the users */}
          {friendsPlaying.map((eachFriend: UserInfosProvider) => {
            return (
              <Col className="friends-col" key={eachFriend.id} xs={12} md={4} lg={2}>
                <Link to="/home/profile">
                <Image className="eyes" src={EyeImg} alt="eye-image" fluid />
                </Link>                
                <Image
                  className="gamers-img"
                  src={eachFriend.avatar}
                  alt="User image"
                  fluid
                />
                {/** */}
              </Col>
            );
          })}
       </Row>
      </Row>
          {/** For leaderboard, trophy */}
          <Row className="trophy-col" xs={12} md={12}>
        <Col className="trophy-column" xs={12} md={4} lg={2}>
        <button className= "trophy-button" onClick={() => setShowDiv(!showDiv)}></button>
      {showDiv&& <div className= "showDiv">
      <h2 className="podium-title">Leaderboard</h2> 
      {winnerAvatar.map((eachWinner:UserInfosProvider)=> {
        return (
          <Col className="leader-col" key={eachWinner.id}>
            <Link to="/game/leaderboard"></Link>
            <Image className="winners-img" src={eachWinner.avatar} alt="winner image" fluid></Image>
          </Col>
        )
      })}
      <Image className="podium-img" src={PodiumImg} alt="podium-image" fluid />
     </div> }
      </Col>
        </Row> 
    </Container>
  );
}
