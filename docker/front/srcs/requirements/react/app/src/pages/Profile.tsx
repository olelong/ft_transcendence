import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

export default function Profile() {
  let { id } = useParams(); // On récupère l'id de l'url /home/profile[/:id]
  if (id === undefined) id = ""; // Si l'id est undefined alors le user est sur sa propre page profile

  const [userInfos, setUserInfos] = useState<any>();
  const [userExists, setUserExists] = useState<boolean | null>(null);

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
  console.log("userInfos:", userInfos && userInfos.id);
  const ProfileInfos = () => {
    return (
      <Container className="profile-infos">
        <p className="profile-id">{userInfos && userInfos.id}</p>
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
      <img
        src={ logo }
        alt="CatPong logo"
        className="profile-logo-error"
      />
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
