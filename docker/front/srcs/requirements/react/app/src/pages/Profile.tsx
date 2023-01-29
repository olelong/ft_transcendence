import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
// My components
import Avatar from "../components/profile/Avatar";
import Tabs from "../components/profile/Tabs";
// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/profile/Profile.css";
// Image
import logo from "../assets/main/pictoGrand.png";

import { serverUrl } from "../index";
import { Spinner } from "react-bootstrap";
import { extname } from "node:path/win32";

export default function Profile() {
  let { id } = useParams(); // On récupère l'id de l'url /home/profile[/:id]
  if (id === undefined) id = ""; // Si l'id est undefined alors le user est sur sa propre page profile

  const [userInfos, setUserInfos] = useState<any>();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [inputMessage, setInputMessage] = useState<string | "">("");

  // Récupérer les user infos:
  const url = serverUrl + `user/profile/${id}`;
  console.log(url);
  useEffect(() => {
    fetch(url)
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

  // Changer les informations du user:
  const onSubmit = (userInput: string) => {
    fetch(serverUrl + "user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userInput,
      }),
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
      alert("TFA activated");
      setQrUrl(null);
    }
  }, [tfaValid]);

  const changeTfa = (on: boolean) => {
    fetch(serverUrl + "user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tfa: on }),
    })
      .then((res) => res.json())
      .then(({ ok, tfa }) => {
        if (ok) alert("TFA deactivated");
        if (tfa) setQrUrl(tfa);
      });
  };

  const checkTfaCode = (code: string) => {
    fetch(serverUrl + "user/profile/tfavalidation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then(({ valid }) => setTfaValid(valid))
      .catch(console.error);
  };

  // Afficher les infos du user:
  const ProfileInfos = () => {
    const [userInput, setUserInput] = useState<string>("");

    // Tentative de retirer et changer le style du message d'erreur de
    // pattern de l'input par défaut du navigateur: Peut etre tenter un overlay mais trouver comment savoir quand afficher le message
    /* 
    let inputTest = document.getElementById("displayName");
    if (inputTest) {
      inputTest.addEventListener(
        "invalid",
        function (e) {
          e.preventDefault();
          <p className="inputTest">Hello it's a message error</p>;
          if (inputTest) {
            inputTest.style.backgroundColor = "violet";
            inputTest.innerHTML = "Hello!!";
          }
        },
        true
      );
    } 
    */

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
              name="displayName"
              value={userInput}
              autoComplete="off"
              pattern="^[\w-]{2,30}$" // Use of regex (regular expression)
              title="Display name should only contain letters, numbers, underscores and hyphens. The size must be at least 2 characters and not exceed 30"
              placeholder={userInfos && userInfos.name}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </label>
          <button type="submit" className="displayname-button">
            Save Changes
          </button>
          <p className="input-message-displayname">{inputMessage}</p>
        </Form>
        <div>
          <p className="tfa-title">2FA</p>
          <button onClick={() => changeTfa(true)}>Activate TFA</button>
          <button onClick={() => changeTfa(false)}>Deactivate TFA</button>
          {qrUrl && (
            <>
              <img src={qrUrl} alt="tfa qrcode" height={250} />
              <input onChange={(e) => setTfaCode(e.target.value)} />
              <button
                onClick={() => {
                  setTfaValid(null);
                  checkTfaCode(tfaCode);
                }}
              >
                Confirm
              </button>
              {tfaValid === false && (
                <p style={{ color: "red" }}>Invalid code</p>
              )}
            </>
          )}
        </div>
      </Container>
    );
  };

  return userExists === null ? (
    <Spinner />
  ) : userExists ? (
    <div>
      <Avatar id={id} />
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
                    /* TODO pour mardi:
                     - Refaire exam a la maison 
                     - Finir style de la 2fa
                     - Finir changement d'avatar
                     - Finir l'affichage de toutes les stats */

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