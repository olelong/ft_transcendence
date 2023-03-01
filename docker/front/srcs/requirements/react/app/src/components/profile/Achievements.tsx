import "bootstrap/dist/css/bootstrap.min.css";
import { AchievementsProps } from "../../types/profile.interface";
import "../../styles/profile/ProfileTabs.css";

import ProgressBar from "react-bootstrap/ProgressBar";

export default function Achievements({
  userInfosAchievements,
}: {
  userInfosAchievements: AchievementsProps[];
}) {
  console.log("ok: ", userInfosAchievements[0].score);
  return (
    <div
      className="achiev-global"
      style={{
        overflowY:
          userInfosAchievements && userInfosAchievements.length > 4
            ? "scroll"
            : "hidden",
      }}
    >
      {userInfosAchievements &&
        userInfosAchievements.map((achiev: any, index) => (
          <div className="achiev-div" key={index}>
            <div className="achiev-left">
              <p className="achiev-p">{achiev.name}</p>
              <p className="achiev-p" style={{ fontSize: "13px" }}>
                {achiev.desc}
              </p>
              <ProgressBar
                className="achiev-progress-bar"
                animated
                variant="achiev-progress-bar"
                label={`${achiev.score} / ${achiev.goal} games`}
                now={achiev.score}
                min={0}
                max={achiev.goal}
              />
            </div>
            <div className="achiev-right">
              <img
                src={achiev.img}
                alt="achievements's icon"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
