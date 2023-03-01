import "bootstrap/dist/css/bootstrap.min.css";
import { AchievementsProps } from "../../types/profile.interface";
import "../../styles/profile/ProfileTabs.css";

import badge from "../../assets/achievements/badge1.png";
import ProgressBar from 'react-bootstrap/ProgressBar';

export default function Achievements({
  userInfosAchievements,
}: {
  userInfosAchievements: AchievementsProps[];
}) {
  return (
    <div className="achiev-global">
      <div className="achiev-left">
        <p className="achiev-p">Win 5 games</p>
        <p className="achiev-p" style={{fontSize: "13px"}}>Description</p>
        <ProgressBar className="achiev-progress-bar" animated variant="achiev-progress-bar" label="2 / 5 games" now={2} min={0} max={5}/>
      </div>
      <div className="achiev-right">
        <img src={badge} alt="achievements's icon" style={{width: "100%"}}/>
      </div>
    </div>
  );
}
