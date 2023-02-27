import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";

import Achievements from "./Achievements";
import FriendsBlocked from "./FriendsBlocked";
import HistoryGame from "./HistoryGames";

import { ProfileTabsProps } from "../../types/profile.interface";

export default function ProfileTabs({
  isBlocked,
  setIsBlocked,
  isMyProfilePage,
  userInfosGames,
  name,
}: ProfileTabsProps) {
  return (
    <Container className="profile-tabs-global-div">
      <Tabs
        className="profile-tabs-global"
        defaultActiveKey="history" /*defaultActiveKey="achievements"*/
      >
        <Tab
          title="Achievements"
          eventKey="achievements"
          tabClassName="profile-tab"
        >
          <Achievements />
        </Tab>
        <Tab title="History" eventKey="history" tabClassName="profile-tab">
          <HistoryGame userInfosGames={userInfosGames} name={name} />
        </Tab>
        {isMyProfilePage && isMyProfilePage === true && (
          <Tab
            title="Blocked"
            eventKey="listBlocked"
            tabClassName="profile-tab"
          >
            <FriendsBlocked isBlocked={isBlocked} setIsBlocked={setIsBlocked} />
          </Tab>
        )}
      </Tabs>
    </Container>
  );
}
/* eventKey="", Permet de séparer les onglets les un des autres*/
