import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";

import win from "../../assets/history/win.png";
import lose from "../../assets/history/lose.png";
import totalLoses from "../../assets/history/totalLoses.png";
import totalWins from "../../assets/history/totalWins.png";
import titleHistory from "../../assets/history/titleHistory.png";
import { Games, Stats } from "../../types/profile.interface";

function formatDate(dateString: Date) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Permet d'afficher
function m(n: number, d: number) {
  let x = ("" + n).length;
  let p = Math.pow;
  d = p(10, d);
  x -= x % 3;
  return (
    (Math.round((n * d) / p(10, x)) / d).toFixed(d.toString().length - 1) +
    " kMGTPE"[x / 3]
  );
}

export default function HistoryGames({
  userInfosGames,
  name,
  userInfosStats,
}: {
  userInfosGames: Games[];
  name: string;
  userInfosStats: Stats;
}) {
  const sortedGames =
    userInfosGames &&
    [...userInfosGames].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
  return (
    <div
      style={{
        overflowY:
          userInfosGames && userInfosGames.length > 3 ? "scroll" : "hidden",
      }}
      className="history-games"
    >
      <div className="total-score-global">
        <img
          src={totalWins}
          alt="total number of win icon"
          style={{ width: "35px" }}
        />
        { userInfosStats && ( 
        <p className="total-score-p">
          {userInfosStats && userInfosStats.wins > 999
            ? m(userInfosStats.wins, 1)
            : userInfosStats.wins}{" "}
          {userInfosStats.wins > 1 ? "wins" : "win"}
        </p> )}
        <img
          src={totalLoses}
          alt="total number of lose icon"
          style={{ width: "35px", marginLeft: "15px" }}
        />
        {userInfosStats && (
        <p className="total-score-p">
          {" "}
          {userInfosStats && userInfosStats.loses > 999
            ? m(userInfosStats.loses, 1)
            : userInfosStats.loses}{" "}
          {userInfosStats.loses > 1 ? "defeats" : "defeat"}
        </p>)}
      </div>
      {sortedGames &&
        sortedGames.length > 0 &&
        sortedGames.map((game: any, index) => (
          <div className="history-games-global" key={index}>
            <div className="title-history-div">
              <img
                src={titleHistory}
                alt="title's icon for history"
                className="title-history-icon-left"
              />
              <p className="title-history-date">{formatDate(game.timestamp)}</p>
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
      {sortedGames && sortedGames.length === 0 && (
        <p className="history-game-zero">No game history yet</p>
      )}
    </div>
  );
}
