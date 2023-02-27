import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";
import { useEffect, useState } from "react";

import win from "../../assets/history/win.png";
import lose from "../../assets/history/lose.png";
import titleHistory from "../../assets/history/titleHistory.png";
import { Games } from "../../types/profile.interface";
import { userInfo } from "os";

export default function HistoryGames({
  userInfosGames,
}: {
  userInfosGames: Games[];
}) {
  return (
    <>
      <div className="history-games-global">
        <div className="title-history-div">
          <img
            src={titleHistory}
            alt="title's icon for history"
            className="title-history-icon-left"
          />
          <p className="title-history-date">20/12/2012, 03:00:00</p>
          <img
            src={titleHistory}
            alt="title's icon for history"
            className="title-history-icon-right"
          />
        </div>
        <div className="history-games-myscore">
          <img
            src={
              /*userInfosGames.myScore > userInfosGames.enemyScore ? win : lose*/ win
            }
            alt="myscore icon"
            style={{ width: "45px" }}
          />
          <p className="score-p">0</p>
          <p className="history-game-name">me</p>
        </div>
        <div className="history-games-enemy-score">
          <img src={lose} alt="enemy score icon" style={{ width: "45px" }} />
          <p className="score-p">11</p>
          <p>enemy</p>
        </div>
      </div>
    </>
  );
}

/* Moi tout le temps a gauche que je perde ou gagne */
