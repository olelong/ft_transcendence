import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Switch from "react-switch";
// My components
import Avatar from "../components/profile/Avatar";
import Tabs from "../components/profile/Tabs";
// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/profile/Profile.css";
// Image
import logo from "../assets/main/pictoGrand.png";
import valid from "../assets/icons/valid.png";
import score from "../assets/icons/score.png";
import star from "../assets/icons/star.png";

import { serverUrl } from "../index";
import { Spinner } from "react-bootstrap";

export default function Profile() {
  let { id } = useParams(); // On récupère l'id de l'url /home/profile[/:id]
  if (id === undefined) id = ""; // Si l'id est undefined alors le user est sur sa propre page profile

  const [userInfos, setUserInfos] = useState<any>();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [inputMessage, setInputMessage] = useState<string | "">("");
  const [displayNameMsgErr, setDisplayNameMsgErr] = useState<string | "">("");

  // Récupérer les user infos:
  const url = serverUrl + `/user/profile/${id}`;
  console.log(url);
  useEffect(() => {
    fetch(url, { credentials: "include" })
      .then((res) => {
        console.log("res: ", res.status);
        if (res.status === 404) {
          setUserExists(false);
          throw new Error("User not found!");
        }
        setUserExists(true);
        return res.json();
      })
      .then((data) => {
        setUserInfos(data);
        console.log("data:", data);
      })
      .catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Afficher les infos du user:
  const ProfileInfos = () => {
    const [userInput, setUserInput] = useState<string>("");

    // Changer les informations du user:
    const onSubmit = (userInput: string) => {
      fetch(serverUrl + "/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userInput,
        }),
        credentials: "include",
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          if (data.name === false)
            setInputMessage("Display name is already taken!");
          else setInputMessage("Display name change.");
          // si c'est false: afficher erreur sinon rien ou mettre a jour sur le placeholder le nouveau
          console.log("data:", data);

          console.log("inputMessage:", inputMessage);
        })
        .catch((err) => console.error(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    /* Tfa */
    const [qrUrl, setQrUrl] = useState(null);
    const [tfaCode, setTfaCode] = useState("");
    const [tfaValid, setTfaValid] = useState(null);

    useEffect(() => {
      if (tfaValid === true) {
        console.log("TFA activated");
        setQrUrl(null);
      }
    }, [tfaValid]);

    const changeTfa = (on: boolean) => {
      fetch(serverUrl + "/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tfa: on }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then(({ ok, tfa }) => {
          if (ok) console.log("TFA desactivated");
          if (tfa) setQrUrl(tfa);
          else setQrUrl(null);
        });
    };

    const checkTfaCode = (code: string) => {
      fetch(serverUrl + "/user/profile/tfavalidation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then(({ valid }) => setTfaValid(valid))
        .catch(console.error);
    };

    const [checkedSwitch, setCheckedSwitch] = useState<boolean>(false);
    const [tfaInputErrorMessage, setTfaInputErrorMessage] = useState("");

    // Pour retirer le message d'erreur de pattern de l'input par défaut
    // du navigateur:
    let inputTest = document.getElementById("displayName");
    if (inputTest) {
      inputTest.addEventListener(
        "invalid",
        function (e) {
          e.preventDefault();
        },
        true
      );
    }

    // Pour ajouter la possibilité de valider le code avec la touche enter:
    const handleKeyDown = (e: any) => {
      if (e.key === "Enter") {
        setTfaValid(null);
        if (
          !/^\d{6}$/.test(tfaCode) ||
          /^\{0}$/.test(tfaCode) ||
          /^0{6}$/.test(tfaCode)
        ) {
          setTfaInputErrorMessage(
            "Incorrect code, please enter a 6-digit code."
          );
        } else {
          checkTfaCode(tfaCode);
        }
      }
    };

    const winRate = userInfos && userInfos.stats.wins / userInfos.stats.loses;
    const winRateDisplayable = Math.round(winRate * 100);

    return (
      <Container className="profile-infos">
        <p className="profile-id">{userInfos && userInfos.id}</p>

        <Form
          className="displayname-form"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("salut");
            onSubmit(userInput);
          }}
        >
          <label className="displayname-label">
            Display name:
            <input
              type="text"
              id="displayName"
              name="profile-input"
              value={userInput}
              autoComplete="off"
              pattern="^[\w-]{2,30}$" // Use of regex (regular expression)
              placeholder={userInfos && userInfos.name}
              onChange={(e) => {
                setUserInput(e.target.value);
                setDisplayNameMsgErr("");
              }}
            />
            {displayNameMsgErr && (
              <div className="display-name-error-message">
                {displayNameMsgErr}
              </div>
            )}
          </label>
          <button
            type="submit"
            className="displayname-button"
            onClick={() => {
              if (!/^[\w-]{2,30}$/.test(userInput))
                setDisplayNameMsgErr(
                  "Invalid display name. Use letters, numbers, _, and -. Min 2, max 30 chars."
                );
            }}
          >
            Save Changes
          </button>
          <p className="input-message-displayname">{inputMessage}</p>
        </Form>
        <div>
          <p className="tfa-title">2FA</p>
          <label className="tfa-label-switch">
            <Switch
              checked={checkedSwitch}
              onChange={(checked: any) => {
                setCheckedSwitch(checked);
                changeTfa(checked);
              }}
              onColor="#d8b9e8"
              onHandleColor="#ffffff"
              offColor="#d09de2"
              offHandleColor="#ffffff"
              boxShadow="0px 1px 4px rgba(255, 255, 255, 255)"
              activeBoxShadow="0px 0px 1px 3px rgba(255, 255, 255, 255)"
              checkedIcon={
                <div
                  style={{
                    position: "relative",
                    left: "12px",
                    top: "5px",
                    fontSize: 20,
                    color: "white",
                    outline: "none",
                  }}
                >
                  On
                </div>
              }
              uncheckedIcon={
                <div
                  style={{
                    position: "relative",
                    left: "8px",
                    top: "5px",
                    fontSize: 20,
                    color: "white",
                    outline: "none",
                  }}
                >
                  Off
                </div>
              }
              height={40}
              width={90}
              className="tfa-switch"
            />
          </label>
          <br />
          <br />
          {qrUrl && (
            <div className="tfa-popup">
              <p className="tfa-popup-title">
                Activation connection with Two Factor Authentification{" "}
              </p>
              <img src={qrUrl} alt="tfa qrcode" className="tfa-qrcode" />
              <input
                id="tfa-input"
                name="profile-input"
                pattern="^[\d]{6}$"
                value={tfaCode}
                placeholder="  Code"
                onChange={(e) => {
                  setTfaCode(e.target.value);
                  setTfaInputErrorMessage("");
                }}
                onKeyDown={handleKeyDown} // Permet de valider le code avec la toucher enter
              />
              {tfaInputErrorMessage && (
                <div className="tfa-input-error-message">
                  {tfaInputErrorMessage}
                </div>
              )}
              <button
                className="tfa-valid-button"
                onClick={() => {
                  setTfaValid(null); // Ligne du dessous permet de check si le code entré correspond au pattern et de renvoyer un message d'erreur personnalisé si il ne correspond pas!
                  if (
                    !/^\d{6}$/.test(tfaCode) ||
                    /^\{0}$/.test(tfaCode) ||
                    /^0{6}$/.test(tfaCode)
                  ) {
                    // !!!!! Retirer /^0{6}$/.test(tfaCode) apres merge avec le vrai back
                    setTfaInputErrorMessage(
                      "Incorrect code, please enter a 6-digit code."
                    );
                  }
                  checkTfaCode(tfaCode);
                }}
              >
                <img
                  src={valid}
                  alt="button to validate tfa code"
                  className="tfa-valid-img"
                />
              </button>
            </div>
          )}
          <Container className="profile-stats">
            <div className="profile-score-div">
              <p className="profile-score-p"> SCORE </p>
              <img
                src={score}
                alt="score's icon"
                className="profile-score-img"
              />
              <p className="profile-score-nb">{winRateDisplayable}</p>
            </div>
            <div className="profile-rank-div">
              <p className="profile-rank-p">
                <img
                  src={star}
                  alt="rank's icon"
                  className="profile-rank-star-first"
                />
                RANK 
                <img
                  src={star}
                  alt="rank's icon"
                  className="profile-rank-star-last"
                />
                <br />
                <p style={{ color: "white", fontSize: "22px" }}> {userInfos && userInfos.stats.rank} </p>
              </p>
            </div>
          </Container>
        </div>
      </Container>
    );
  };

  return userExists === null ? (
    <Spinner />
  ) : userExists ? (
    <div>
      <Avatar id={id} userInfos={userInfos} />
      <ProfileInfos />
      <Tabs />
    </div>
  ) : (
    <Container className="user-not-exist">
      <img src={logo} alt="CatPong logo" className="profile-logo-error" />
      <p>User does not exist!</p>
    </Container>
  );
}

/*
      Won games: {userInfos && userInfos.stats.wins} <br />
      Lost games: {userInfos && userInfos.stats.loses}
*/

/*
  On met un spinner, si on ne connait pas encore l'id,
  ensuite on on affiche le profil si il existe sinon on
  affiche une erreur sur la page.
*/

/*
  Pattern en regex pour : (min:2 max:30 tiret, chiffres, lettres, underscore)
*/

/* NOTES */

/* 2FA */
/* Si on put tfa a false, le back repond "ok: true"
 si reponse res.status = 200 c'est que tout s'est bien passé 
 Si on put tfa a true, le back repond l'url d'un qrcode au hasard
 Get user/profile pour le switch, si tfa dans la reponse est 
 false => switch false sinon tfa true donc switch true
*/

/* Ajouter le fait de differencier le user et les autres */

/*  input displayName: 
    Pattern en regex pour : (min:2 max:30 tiret, chiffres, lettres, underscore)
    Ajouter une vérification du minimum de charactere, du numalpha seulement 
    pas de caracteres speciaux avant de l'envoyer au back,
    vérifier qu'il soit unique dans le back (requete PUT /user/profile)
    donc si name = false dans la reponse du back alors il doit changer mais si le back 
    renvoie true alors c'est modifier directement et afficher en dessous l'existant*/
/*

- Avatar photo avec possibilité de le changer:
  Donc un composant pour modifier l'avatar.
- Container => id, displayName, 2FA, STATS, theme:
  Donc un composant, pour changer le displayName.
  Un autre pour activer/désactiver la 2FA.
  Un autre pour mettre a jour les stats automatiquement.
  Un autre pour changer le thème d'une game.
- Container => Contenant tous les achievements:
  Un composant pour la liste entière des achievements et
  un autre pour s'occuper de chaque achievements individuellement.
  Gérer la liste de tous les achievements et mettre a jour
  ceux qui sont atteints.
- Ajouter la possibilité de voir la liste des amis bloqués pour en 
débloquer ou non.
- Ajouter l'historique des games.
  
Au meme endroits que les achievements mettre un onglet Achievements,
historique des games, liste des amis bloques. Comme ca la personne
clique sur l'onglet qu'elle souhaite mais le premier reste celui
des achievements.



Si il y a pas d'avatar choisi, en mettre un par defaut.
*/

/*ACHIEVEMENTS*/
/*
  - Win more than 10 games
  - Create a channel group
  - Win your first game
  - Win more than 50 games
  - Add a first friend
  - Play with another theme
  - Become Rank 1
  - Be in the top 3
  - Play for the first time

  => Trouver des noms sympas, des pictos d'achievements.
*/

/*
Page profile qui doit s'adapter a la page profile du user
mais aussi de ses amis.

/home/profile => current user
home/profile/id => other user 

Meme composant utilisé pour les deux.
Dans ce composant, je dois lire l'url et si il y a un id
je dois recuperer l'id.
Si il existe, on doit pas pouvoir modifier le profile,
on doit faire la requete GET /user/profile/id et ne pas recevoir dans la
reponse la tfa et le theme et donc pas les afficher.
Avec du ternaire enlever les options de modifications.


*/
