import { Button, Col, Container, Row, Image} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Play.css";
import { serverUrl } from "index";

import UserImg from "../assets/main/tabby.png";
import EyeImg from "../assets/icons/eye2.png";
import TrophyImg from "../assets/podium/trophee.png";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
export const LS_KEY_42API = "42-tokens";
const playUrl = `localhost:3000/home/chat`;


export default function Play() {
  const [login, setLogin] = useState("");
  const [friendsPlaying, setFriendsPlaying] = useState([]);


  useEffect(() => {
    fetch(serverUrl + "game/friendsplaying")
      .then((res) => res.json())
      .then((data) => setFriendsPlaying(data.users))
      .catch((err) => console.error(err));
  }, []);


  const [profilePicture, setProfilePicture] = useState("");

  return (
    <Container className="play-container">
        {/** This is a test*/}

    <img src={profilePicture} alt="profile picture" />


      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          <div>
            <Image className="UserImg" src={UserImg} alt="User image" fluid/>
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
          <Link to="/home/profile">
            <Image className="trophy-board" src={TrophyImg} alt="Trophy img" fluid />
            </Link>
            </Col>
        </Row> 
    </Container>
  );
}
