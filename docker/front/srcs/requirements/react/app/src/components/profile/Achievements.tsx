import "bootstrap/dist/css/bootstrap.min.css";
import { AchievementsProps } from "../../types/profile.interface";
import "../../styles/profile/ProfileTabs.css";

import ProgressBar from "react-bootstrap/ProgressBar";
import { serverUrl } from "index";

/* 
Trier les achievements recus par le back  par 
obtenu(si score >= au goal) et non obtenu, ensuite checker 
lesquels font parties de la meme categories grace au regex, 
ensuite celui qui a le goal le plus haut du groupe est affiché.
Dans les pas obtenues, checker lequel a le goal le plus haut 
dans le groupe pour l'afficher en grisé. 
*/

export default function Achievements({
  userInfosAchievements,
}: {
  userInfosAchievements: AchievementsProps[];
}) {
  const achievementsObtained =
    userInfosAchievements &&
    [...userInfosAchievements].sort((a) => {
      return a.score >= a.goal ? -1 : 1;
    });

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
      {achievementsObtained &&
        achievementsObtained.map((achiev: any, index) => (
          <div
            className={
              achiev.score < achiev.goal ? "achiev-div-shadow" : "achiev-div"
            }
            key={index}
          >
            <div className="achiev-left">
              <p className="achiev-p">{achiev.name}</p>
              <p className="achiev-p" style={{ fontSize: "12px" }}>
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
                src={serverUrl + achiev.img}
                alt="achievements's icon"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
