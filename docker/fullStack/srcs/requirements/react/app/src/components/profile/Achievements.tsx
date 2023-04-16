import "bootstrap/dist/css/bootstrap.min.css";
import { AchievementsProps } from "../../types/profile.interface";
import "../../styles/profile/ProfileTabs.css";

import ProgressBar from "react-bootstrap/ProgressBar";
import { serverUrl } from "index";

export default function Achievements({
  userInfosAchievements,
}: {
  userInfosAchievements: AchievementsProps[];
}) {
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
        userInfosAchievements
          .sort((a: AchievementsProps, b: AchievementsProps) => {
            const aObtained = a.score >= a.goal;
            const bObtained = b.score >= b.goal;
            if (aObtained !== bObtained) {
              if (aObtained) return -1;
              return 1;
            }
            return a.name < b.name ? -1 : 1;
          })
          .filter((a: AchievementsProps, _, arr) => {
            const regexes = [/^Win (\d*) games?.$/, /^Add (\d*) friends?.$/];
            let matchRegex: RegExp | null = null;
            for (const regex of regexes) {
              const match = a.desc.match(regex);
              if (match) matchRegex = regex;
            }
            if (!matchRegex) return true;
            const obtained = a.score >= a.goal;
            const groupAchievements = arr.filter((g) => {
              const gObtained = g.score >= g.goal;
              return (
                g.desc.match(matchRegex as RegExp) &&
                obtained === gObtained &&
                a.desc !== g.desc
              );
            });
            for (const g of groupAchievements) {
              if (obtained && a.goal < g.goal)
                return false;
              if (!obtained && a.goal > g.goal)
                return false;
            }
            return true;
          })
          .map((achiev: any, index) => (
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
                  label={`${achiev.score} / ${achiev.goal}`}
                  now={achiev.score}
                  min={0}
                  max={achiev.goal}
                />
              </div>
              <div className="achiev-right">
                <img
                  src={serverUrl + achiev.img}
                  alt="achievements's icon"
                  className="achiev-icon"
                />
              </div>
            </div>
          ))}
    </div>
  );
}
