import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import FormLabel from "react-bootstrap/FormLabel";
import Switch from "react-switch";
import Select from "react-select";
// My components
import Avatar from "../components/profile/Avatar";
import Tabs from "../components/profile/Tabs";
// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/profile/Profile.css";
// Image
import logo from "../assets/main/pictoGrand.png";
import addFriend from "../assets/icons/add_friend.png";
import valid from "../assets/icons/valid.png";
import score from "../assets/icons/score.png";
import star from "../assets/icons/star.png";

import { serverUrl } from "../index";
import { Spinner } from "react-bootstrap";

import { getLogin } from "../utils/auth";
import { ProfileProps } from "types/profile.interface";

// Peut etre ajouter une props pour verifier si on ajoute ou supprime un ami
function AddFriend({ userInfosId, login, setIsMyFriend }: ProfileProps) {
  alert("ok");
  fetch(serverUrl + "/user/friends/" + userInfosId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ add: true }),
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      setIsMyFriend(false);
      if (data.ok === true) setIsMyFriend(true);
      console.log("data.ok:", data.ok);
    })
    .catch((err) => console.error(err));

}

export default function Profile() {
  let { id } = useParams(); // On récupère l'id de l'url /home/profile[/:id]
  if (id === undefined) id = ""; // Si l'id est undefined alors le user est sur sa propre page profile

  const [userInfos, setUserInfos] = useState<any>();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [inputMessage, setInputMessage] = useState<string | "">("");
  const [displayNameMsgErr, setDisplayNameMsgErr] = useState<string | "">("");
  const [isMyProfilePage, setIsMyProfilePage] = useState<boolean>();
  const [login, setLogin] = useState("");

  // Récupérer les user infos:
  const url = serverUrl + `/user/profile/${id}`;
  //console.log(url);
  useEffect(() => {
    getLogin(setLogin); // On récupére le login via l'api de l'intra
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // On modifie le booleen isMyProfilePage selon si c'est notre page de profile ou non
    if (login !== "" && userInfos) {
      setIsMyProfilePage(false);
      if (login === userInfos.id) setIsMyProfilePage(true);
    }
  }, [login, userInfos]);

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
          //console.log("data:", data);

          //console.log("inputMessage:", inputMessage);
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
        //console.log("TFA activated");
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
          //if (ok) console.log("TFA desactivated");
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
        .then(({ valid }) => {
          if (valid) setTfaCode("");
          setTfaValid(valid);
        })
        .catch(console.error);
    };

    const [checkedSwitch, setCheckedSwitch] = useState<boolean>(false);
    const [tfaInputErrorMessage, setTfaInputErrorMessage] = useState("");
    const [tfaPopupVisibility, setTfaPopupVisibility] = useState(true);

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

    let winRateDisplayable = 0;
    if (
      userInfos &&
      typeof userInfos.stats.wins === "number" &&
      typeof userInfos.stats.loses === "number"
    ) {
      const winRate = userInfos.stats.wins / userInfos.stats.loses;
      winRateDisplayable = Math.round(winRate * 100);
    }

    /* Changer le thème de jeu */
    const changeTheme = (themeGame: string) => {
      fetch(serverUrl + "/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeGame }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then(({ ok }) => {
          if (ok) setThemeGame(themeGame); //console.log("Theme changed");
        })
        .catch((err) => console.error(err));
    };

    /* Changer le style du select-react pour le theme des game */
    const options = [
      { value: "classic", label: "Classic" },
      { value: "galactic", label: "Galactic" },
      { value: "retro", label: "Retro" },
    ];
    const customStyles = {
      option: (defaultStyles: any, state: any) => ({
        ...defaultStyles,
        color: "#fff",
        backgroundColor: state.isSelected
          ? "#be70d9"
          : state.isFocused
          ? "#d09de2"
          : "#d8b9e8",
        cursor: "pointer",
      }),

      control: (defaultStyles: any) => ({
        ...defaultStyles,
        backgroundColor: "#d8b9e8",
        border: "none",
        boxShadow: "none",
        borderRadius: "10px",
        cursor: "pointer",
      }),
      singleValue: (defaultStyles: any) => ({
        ...defaultStyles,
        color: "#f500ef",
      }),
    };

    const [themeGame, setThemeGame] = useState(userInfos && userInfos.theme);
    const handleChangeSelect = (selectedOption: any) => {
      setUserInfos({ ...userInfos, theme: selectedOption.value });
      changeTheme(selectedOption.value);
      setThemeGame(selectedOption.label);
      console.log(selectedOption.value);

      console.log("label:", themeGame);
    };

    /* Add a friend */
    const [isMyFriend, setIsMyFriend] = useState(false);
    /*useEffect(() => {

    }, [isMyFriend])
    */

    const firstCap = (str: string | undefined): string | undefined => {
      if (!str) return str;
      return str[0].toUpperCase() + str.slice(1);
    };

    return (
      <Container className="profile-infos">
        <p className="profile-id">{userInfos && userInfos.id}</p>
        {isMyProfilePage === false && (
          <>
            <div className="friend-displayname">
              <p>{userInfos && userInfos.name}</p>
            </div>
            <div className="add-friend">
              <div className="add-friend-title">
                <p>Add friend</p>
              </div>
              <Form
                className="add-friend-form-button"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <button
                  type="submit"
                  className="add-friend-button"
                  onClick={(e: any) => {
                    AddFriend({
                      userInfosId: userInfos?.id || "",
                      login,
                      setIsMyFriend,
                    })
                    console.log("isMyFriend: ", isMyFriend);
                    e.preventDefault();
                  }}
                >
                  <img
                    src={addFriend}
                    alt="Add friend picto"
                    style={{
                      width: "35px",
                      padding: "3px",
                    }}
                  />
                </button>
              </Form>
              {isMyFriend && <p>Friend added!!</p>}
            </div>
          </>
        )}
        {isMyProfilePage === true && (
          <>
            <Form
              className="displayname-form"
              onSubmit={(e) => {
                e.preventDefault();
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
                  if (!/^[\w-]{2,30}$/.test(userInput)) {
                    setDisplayNameMsgErr(
                      "Invalid display name. Use letters, numbers, _, and -. Min 2, max 30 chars."
                    );
                    setInputMessage("");
                  }
                }}
              >
                Save Changes
              </button>
              <p className="input-message-displayname">{inputMessage}</p>
            </Form>
          </>
        )}
        {userInfos && userInfos.tfa !== undefined && (
          <>
            <p className="tfa-title">2FA</p>
            <label className="tfa-label-switch">
              <Switch
                checked={checkedSwitch}
                onChange={(checked: any) => {
                  setCheckedSwitch(checked);
                  changeTfa(checked);
                  if (checked === true) {
                    setTfaValid(null);
                    setTfaPopupVisibility(true);
                  }
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
          </>
        )}
        <br />
        <br />
        {qrUrl && tfaPopupVisibility && (
          <div className="tfa-popup">
            <div className="tfa-popup-close-btn">
              <button
                onClick={() => {
                  //console.log("valid: ", tfaValid);
                  if (!tfaValid) setCheckedSwitch(false);
                  setTfaPopupVisibility(false);
                  setTfaCode("");
                }}
              ></button>
            </div>
            <p className="tfa-popup-title">
              Activation connection with Two Factor Authentification{" "}
            </p>
            <img src={qrUrl} alt="tfa qrcode" className="tfa-qrcode" />
            <input
              id="tfa-input"
              name="profile-input"
              pattern="^[\d]{6}$"
              autoComplete="off"
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
                } else checkTfaCode(tfaCode);
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
            <p className="profile-score-p">
              <strong>SCORE</strong>
            </p>
            <img src={score} alt="score's icon" className="profile-score-img" />
            <p className="profile-score-nb">
              <strong>{winRateDisplayable}</strong>
            </p>
          </div>
          <div className="profile-rank-div">
            <p className="profile-rank-p">
              <img
                src={star}
                alt="rank's icon"
                className="profile-rank-star-first"
              />
              <strong>RANK</strong>
              <img
                src={star}
                alt="rank's icon"
                className="profile-rank-star-last"
              />
              <br />
            </p>
            <p className="profile-rank-nb">
              <strong>{userInfos && userInfos.stats.rank}</strong>
            </p>
          </div>
        </Container>
        {userInfos && userInfos.theme !== undefined && (
          <div className="profile-theme">
            <FormLabel className="profile-theme-title">Theme game: </FormLabel>
            <div
              className="m-auto w-50 text-light"
              style={{ position: "relative", left: "-40px" }}
            >
              <Select
                options={options}
                styles={customStyles}
                value={{ value: themeGame, label: firstCap(themeGame) }}
                onChange={handleChangeSelect}
                isSearchable={false}
              />
            </div>
          </div>
        )}
      </Container>
    );
  };

  return userExists === null || isMyProfilePage === undefined ? (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Spinner
        animation="border"
        style={{
          width: 100,
          height: 100,
        }}
      />
    </div>
  ) : userExists ? (
    <div>
      <Avatar id={id} userInfos={userInfos} isMyProfilePage={isMyProfilePage} />
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
  On met un spinner, si on ne connait pas encore l'id,
  ensuite on on affiche le profil si il existe sinon on
  affiche une erreur sur la page.
*/

/*
  Pattern en regex pour : (min:2 max:30 tiret, chiffres, lettres, underscore)
*/

/* NOTES */

/*
      Won games: {userInfos && userInfos.stats.wins} <br />
      Lost games: {userInfos && userInfos.stats.loses}
*/

/* 2FA */
/* Si on put tfa a false, le back repond "ok: true"
 si reponse res.status = 200 c'est que tout s'est bien passé 
 Si on put tfa a true, le back repond l'url d'un qrcode au hasard
 Get user/profile pour le switch, si tfa dans la reponse est 
 false => switch false sinon tfa true donc switch true
*/

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

/*
<div className="profile-theme">
            <FormLabel className="profile-theme-title">Theme game: </FormLabel>
            <Form.Select
              value={userInfos && userInfos.theme}
              onChange={(e) => {
                e.preventDefault();
                // const newUserInfos = { ...userInfos }; // petite deep copie de userInfos
                // newUserInfos.theme = e.target.value;
                setUserInfos({ ...userInfos, theme: e.target.value });
                changeTheme(e.target.value);
                //console.log(e.target.value);
              }}
              className="profile-theme-options"
            >
              <option value="classic">Classic</option>
              <option value="galactic">Galactic</option>
              <option value="retro">Retro</option>
            </Form.Select>
          </div>
          */
