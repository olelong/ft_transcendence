import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

// My components
import Avatar from "../components/profile/Avatar";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileInfos from "../components/profile/ProfileInfos";
import useWindowSize from "../utils/useWindowSize";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/profile/Profile.css";
// Image
import logo from "../assets/main/pictoGrand.png";
import catLoad from "../assets/main/cat-load.gif";

import { serverUrl } from "../index";
import { LoginContext } from "../components/Header";

export default function Profile() {
  let { id } = useParams(); // On récupère l'id de l'url /home/profile[/:id]
  if (id === undefined) id = ""; // Si l'id est undefined alors le user est sur sa propre page profile

  const [userInfos, setUserInfos] = useState<any>();
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const [isMyProfilePage, setIsMyProfilePage] = useState<boolean>();
  const login = useContext(LoginContext);

  const [isBlocked, setIsBlocked] = useState(false); // True if we re blocked

  const [displayExtraInfo, setDisplayExtraInfo] = useState<boolean>(false);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const size = useWindowSize();

  // Récupérer les user infos:
  const url = serverUrl + `/user/profile/${id}`;
  //console.log(url);
  useEffect(() => {
    // getLogin(setLogin); // On récupére le login via l'api de l'intra
    fetch(url, { credentials: "include" }) // On récupère les infos du profile du user demandé dans l'url
      .then((res) => {
        //console.log("res: ", res.status);
        if (res.status === 404) {
          setUserExists(false);
          throw new Error("User not found!");
        }
        setUserExists(true);
        return res.json();
      })
      .then((data) => {
        setUserInfos(data);
      })
      .catch((err) => console.error(err));
  }, [id, url]); // soit juste id !!!!!!

  useEffect(() => {
    // On modifie le booleen isMyProfilePage selon si c'est notre page de profile ou non
    if (login !== "" && userInfos) {
      setIsMyProfilePage(false);
      if (login === userInfos.id) setIsMyProfilePage(true);
    }
  }, [login, userInfos]);

  // Check if the user is blocked
  useEffect(() => {
    if (userInfos) {
      fetch(serverUrl + "/user/blocks/" + userInfos.id, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setIsBlocked(data.ok);
          //console.log("isBlock:", data.ok);
        })
        .catch((err) => console.error(err));
    }
  }, [userInfos]);

  useEffect(() => {
    setWindowWidth(size.width);
  }, [size]);

  return userExists === null && isMyProfilePage === undefined ? (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <img src={catLoad} alt="Cat running for Loading" width={200} />
    </div>
  ) : userExists && !isBlocked ? (
    <div className="profile-page">
      <Avatar
        id={id}
        userInfos={userInfos}
        isMyProfilePage={isMyProfilePage}
        isBlocked={isBlocked}
      />
      <ProfileInfos
        login={login}
        setUserInfos={setUserInfos}
        userInfos={userInfos}
        isMyProfilePage={isMyProfilePage}
        setIsBlocked={setIsBlocked}
      />
      {displayExtraInfo === false && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setDisplayExtraInfo(true);
          }}
          className={
            isMyProfilePage === true
              ? "button-display-extra-info"
              : "button-display-other-extra-info"
          }
        >
          Extra
        </button>
      )}
      {displayExtraInfo === true && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setDisplayExtraInfo(false);
            if (window.innerWidth !== windowWidth) {
              setWindowWidth(window.innerWidth);
              //window.location.reload();
            }
          }}
          className={
            isMyProfilePage === true
              ? "button-undisplay-extra-info"
              : "button-undisplay-other-extra-info"
          }
        >
          x
        </button>
      )}
      {(displayExtraInfo === true || windowWidth > 942) && (
        <ProfileTabs
          isBlocked={isBlocked}
          setIsBlocked={setIsBlocked}
          isMyProfilePage={isMyProfilePage}
          userInfosGames={userInfos && userInfos.games}
          name={userInfos && userInfos.name}
          userInfosAchievements={userInfos && userInfos.achievements}
          userInfosStats={userInfos && userInfos.stats}
        />
      )}
    </div>
  ) : (
    <Container className="user-not-exist">
      <img src={logo} alt="CatPong logo" className="profile-logo-error" />
      <p>User does not exist!</p>
    </Container>
  );
}

/*
  On met un spinner, si on ne connait pas encore l'id,
  ensuite on on affiche le profil si il existe sinon on
  affiche une erreur sur la page.
*/

/*
  Pattern en regex pour : (min:2 max:30 tiret, chiffres, lettres, underscore)
*/
