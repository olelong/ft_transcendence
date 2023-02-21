import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";

import Achievements from "./Achievements";

export default function ProfileTabs() {
  return (
    <div className="tabs-global-div">
      <Tabs className="tabs-global">
        <Tab
          title="Achievements"
          eventKey="achievements"
          tabClassName="achievements-tab"
        >
          <Achievements />
        </Tab>
        <Tab title="Game History" eventKey="history">
          <p>Hey</p>
        </Tab>
        <Tab title="Blocked List" eventKey="listBlocked">
          <p>Hey2</p>
        </Tab>
      </Tabs>
    </div>
  );
}
/* eventKey="", Permet de séparer les onglets les un des autres*/

/*
Notes:
Commencer par la liste des personnes bloqués car il 
faut recuperer la liste, afficher un avatar, l'id et un bouton debloquer.
*/
