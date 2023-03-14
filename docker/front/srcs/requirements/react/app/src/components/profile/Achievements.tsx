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

function getWinsAchievementLevel(score: number) {
  if (score >= 50) {
    return 3;
  } else if (score >= 15) {
    return 2;
  } else if (score >= 5) {
    return 1;
  } else {
    return 0;
  }
}

function getAddFriendsAchievementLevel(score: number) {
  if (score >= 15) {
    return 3;
  } else if (score >= 5) {
    return 2;
  } else if (score >= 1) {
    return 1;
  } else {
    return 0;
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

function allAchievements(a: AchievementsProps, b: AchievementsProps) {
  // First, check if both achievements have been obtained
  const aObtained = a.score >= a.goal;
  const bObtained = b.score >= b.goal;

  if (aObtained && bObtained) {
    // Both achievements have been obtained, sort by score in descending order
    return b.score - a.score;
  } else if (aObtained) {
    // Only A has been obtained, sort it before B
    return -1;
  } else if (bObtained) {
    // Only B has been obtained, sort it before A
    return 1;
  } else {
    // Neither achievement has been obtained
    const winGames = /^Win (\d+) games?.$/;
    const addFriend = /^Add (\d+) friends?.$/;

    const aMatch = a.desc.match(winGames) || a.desc.match(addFriend);
    const bMatch = b.desc.match(winGames) || b.desc.match(addFriend);

    console.log("a.desc :", a.desc);
    console.log("b.desc :", b.desc);
    console.log("aMatch :", aMatch);
    console.log("bMatch :", bMatch);

    // If A and B are in the same group, check which level has been achieved for each
    if (aMatch && bMatch && getGroup(aMatch[0]) === getGroup(bMatch[0])) {
      const aLevel = aMatch[0].startsWith("Win")
        ? getWinsAchievementLevel(a.score)
        : getAddFriendsAchievementLevel(a.score);
      const bLevel = aMatch[0].startsWith("Win")
        ? getWinsAchievementLevel(b.score)
        : getAddFriendsAchievementLevel(b.score);

      console.log("aLevel :", aLevel);
      console.log("bLevel :", bLevel);
      
      if (aLevel === 3 && bLevel === 3) {
        // Both achievements have achieved the highest level, sort by score in descending order
        return b.score - a.score;
      } else if (aLevel === bLevel) {
        // Both achievements have achieved the same level, sort by remaining levels in ascending order
        const remainingLevelsA = aLevel === 2 ? 1 : 2;
        const remainingLevelsB = bLevel === 2 ? 1 : 2;
        return remainingLevelsA - remainingLevelsB;
      } else {
        // Sort by achieved level in descending order
        return bLevel - aLevel;
      }
    } else if (aMatch) {
      // Only A is in a group, sort it before B
      return -1;
    } else if (bMatch) {
      // Only B is in a group, sort it before A
      return 1;
    } else {
      // Neither A nor B is in a group, sort by score in descending order
      return b.score - a.score;
    }
  }
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
