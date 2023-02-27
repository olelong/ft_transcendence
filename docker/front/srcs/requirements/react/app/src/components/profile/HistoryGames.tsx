import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";
import { useEffect, useState } from "react";

import win from "../../assets/history/win.png";
import lose from "../../assets/history/lose.png";
import titleHistory from "../../assets/history/titleHistory.png";
import { Games } from "../../types/profile.interface";

export default function HistoryGames({
  userInfosGames,
  name,
}: {
  userInfosGames: Games[];
  name: string;
}) {
  if (userInfosGames) {
    console.log("date: ", userInfosGames[0].timestamp);
    const newDate = new Date(userInfosGames[0].timestamp);
    console.log(
      "newDate: ",
      newDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    );
    console.log(
      newDate.toTimeString()
    );
  }
  return (
    <>
      {userInfosGames &&
        userInfosGames.length > 0 &&
        userInfosGames.map((game: any, index) => (
          <div className="history-games-global" key={index}>
            <div className="title-history-div">
              <img
                src={titleHistory}
                alt="title's icon for history"
                className="title-history-icon-left"
              />
              <p className="title-history-date">{game.timestamp}</p>
              <img
                src={titleHistory}
                alt="title's icon for history"
                className="title-history-icon-right"
              />
            </div>
            <div className="history-games-myscore">
              <img
                src={game.myScore > game.enemyScore ? win : lose}
                alt="myscore icon"
                style={{ width: "45px" }}
              />
              <p className="score-p">{game.myScore}</p>
              <p className="history-game-name">{name}</p>
            </div>
            <div className="history-games-enemy-score">
              <img
                src={game.myScore > game.enemyScore ? lose : win}
                alt="enemy score icon"
                style={{ width: "45px" }}
              />
              <p className="score-p">{game.enemyScore}</p>
              <p className="history-game-enemy-name">{game.name}</p>
            </div>
          </div>
        ))}
    </>
  );
}
