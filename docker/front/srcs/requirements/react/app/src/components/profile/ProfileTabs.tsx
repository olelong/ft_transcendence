import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";

import Achievements from "./Achievements";
import FriendsBlocked from "./FriendsBlocked";

export default function ProfileTabs({isBlocked, setIsBlocked, isMyProfilePage} : any) {
  return (
    <Container className="profile-tabs-global-div">
      <Tabs className="profile-tabs-global" defaultActiveKey="listBlocked" /*defaultActiveKey="achievements"*/>
        <Tab
          title="Achievements"
          eventKey="achievements"
          tabClassName="profile-tab"
        >
          <Achievements />
        </Tab>
        <Tab title="History" eventKey="history" tabClassName="profile-tab">
          <p>Hey</p>
        </Tab>
        <Tab title="Blocked" eventKey="listBlocked" tabClassName="profile-tab">
          <FriendsBlocked isBlocked={isBlocked} setIsBlocked={setIsBlocked} />
        </Tab>
      </Tabs>
    </Container>
  );
}
/* eventKey="", Permet de séparer les onglets les un des autres*/

/*
Notes:
Commencer par la liste des personnes bloqués car il 
faut recuperer la liste, afficher un avatar, l'id et un bouton debloquer.
*/
