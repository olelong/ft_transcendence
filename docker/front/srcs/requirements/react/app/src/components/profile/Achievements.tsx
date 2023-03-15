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

function getWinsAchievementLevel(goal: number) {
  if (goal) {
    if (goal >= 5 && goal < 15) {
      return 1;
    } else if (goal >= 15 && goal < 50) {
      return 2;
    } else if (goal >= 50) {
      return 3;
    } else {
      return 0;
    }
  }
}

function getAddFriendsAchievementLevel(goal: number) {
  if (goal) {
    if (goal >= 15) {
      return 3;
    } else if (goal >= 5) {
      return 2;
    } else if (goal >= 1) {
      return 1;
    } else {
      return 0;
    }
  }
}

function getGroup(desc: string): string {
  if (desc.match(/^Win/)) {
    return "Win";
  } else if (desc.match(/^Add/)) {
    return "Add";
  } else {
    return "";
  }
}

function getLevel(goal: number, match: any) {
  if (match[0].startsWith("Win")) return getWinsAchievementLevel(goal) || 0;
  else if (match[0].startsWith("Add"))
    return getAddFriendsAchievementLevel(goal) || 0;
}

function allAchievements(a: AchievementsProps, b: AchievementsProps): number {
  const aObtained = a.score >= a.goal;
  const bObtained = b.score >= b.goal;

  if (aObtained && bObtained) {
    return b.score - a.score;
  } else if (aObtained) {
    return -1;
  } else if (bObtained) {
    return 1;
  } else {
    const winGames = /^Win (\d+) games?.$/;
    const addFriend = /^Add (\d+) friends?.$/;
    const aMatch = a.desc.match(winGames) || a.desc.match(addFriend);
    const bMatch = b.desc.match(winGames) || b.desc.match(addFriend);
    const aGroup = aMatch && getGroup(aMatch[0]);
    const bGroup = bMatch && getGroup(bMatch[0]);
    const aLevel = aMatch && getLevel(a.goal, aMatch[0]);
    const bLevel = bMatch && getLevel(b.goal, bMatch[0]);

    if (aGroup && bGroup && aGroup === bGroup) {
      if (aLevel === 3 && bLevel === 3) {
        return b.score - a.score;
      } else if (aLevel === bLevel) {
        return aLevel === 2 ? 1 : -1;
      } else {
        if (bLevel && aLevel)
          return bLevel - aLevel;
      }
    } else if (aGroup) {
      return -1;
    } else if (bGroup) {
      return 1;
    } else {
      return b.score - a.score;
    }
  }
  return 0;
}

export default function Achievements({
  userInfosAchievements,
}: {
  userInfosAchievements: AchievementsProps[];
}) {
  const sortedAchievements =
    userInfosAchievements && [...userInfosAchievements].sort(allAchievements);

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
      {sortedAchievements &&
        sortedAchievements.map((achiev: any, index) => (
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
