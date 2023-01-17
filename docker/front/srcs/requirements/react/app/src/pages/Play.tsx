import { Button, Col, Container, Row, Image } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Play.css";
import UserImg from "../assets/main/circle_tabby.png";
import EyeImg from "../assets/icons/eye.png";
import { useEffect, useState } from "react";

import { serverUrl } from "index";
const playUrl = `localhost:3000/home/chat`;

export default function Play() {
  const [friendsPlaying, setFriendsPlaying] = useState([]);
  useEffect(() => {
    fetch(serverUrl + "game/friendsplaying")
      .then((res) => res.json())
      .then((data) => setFriendsPlaying(data.users))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Container className="play-container">
      <Row>
        {/** First col to display the UserImg and button  */}
        <Col xs={12} md={12}>
          <div>
            <Image className="UserImg" src={UserImg} alt="User image" fluid />
            <br />
            <Button
              onClick={() => (window.location.href = playUrl)}
              className="btn-outline-light btn-lg play-btn"
            >
              Play
            </Button>
          </div>
        </Col>
        {/** Second col to display the friends */}
        <Row xs={12} md={12}>
          {/** loop for display the users */}
          {friendsPlaying.map((eachFriend: UserInfosProvider) => {
            return (
              <Col key={eachFriend.id} xs={12} md={4} lg={2}>
                <Image
                  className="gamers-img"
                  src={eachFriend.avatar}
                  alt="User image"
                  fluid
                />
                <Button className="gamers-btn">Watch</Button>
              </Col>
            );
          })}
           <Col xs={12} md={4} lg={2}>
              <Button className= "gamers-btn">
                <Image width={100} src="https://static.vecteezy.com/ti/vecteur-libre/p3/6425320-plat-design-trophee-trophee-vecteur-isole-sur-fond-blanc-gratuit-vectoriel.jpg"/>
              </Button>
          </Col>
        </Row>
      </Row>
    </Container>
  );
}
