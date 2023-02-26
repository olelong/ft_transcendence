import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";
import { useEffect, useState } from "react";

import win from "../../assets/history/win.png";
import lose from "../../assets/history/lose.png";
import titleHistory from "../../assets/history/titleHistory.png";
import { Games } from "../../types/profile.interface";

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
            style={{ width: "20px", transform: "scaleX(-1)" }}
          />
          <p className="title-history-date">20/12/2012, 03:00:00</p>
          <img
            src={titleHistory}
            alt="title's icon for history"
            className="title-history-icon-right"
            style={{ width: "20px" }}
          />
        </div>
        <div className="history-games-score">
        <img src={win} alt="win icon" className="win-icon" />
        <p>0</p>
        <p>me</p>
        <img src={lose} alt="lose icon" style={{ width: "60px" }} />
        <p>11</p>
        <p>enemy</p>
        </div>
      </div>
    </>
  );
}

/* Moi tout le temps a gauche que je perde ou gagne */
