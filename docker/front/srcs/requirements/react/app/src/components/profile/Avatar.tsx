import "bootstrap/dist/css/bootstrap.min.css";
//import Button from "react-bootstrap/Button";

import "../../styles/profile/Avatar.css";
import { AvatarProps } from "../../types/profile.interface";

import avatar from "../../assets/avatar/lapin.jpg";
import { useRef } from "react";
//import pencil from "../../assets/icons/pencil.png";

export default function Avatar({ id }: AvatarProps) {
  // Verifier que l'id soit undefined ou non pour
  // savoir si on est sur la page profile du user ou d'un autre
  console.log(window.innerWidth);
  console.log(window.innerHeight);

  // On met dans une variable appelée input, un tag html
  const input = useRef<HTMLInputElement>(null); 

  return (
    <>
      <div className="profile-avatar-circle">
        <img
          src={avatar}
          alt="Profile user's avatar"
          className="profile-avatar"
        />
      </div>

      <form>
        <div
          className="change-avatar-button"
          // On créer un event click et on le renvoie à l'input
          onClick={() => {
            if (input && input.current)
              input.current.dispatchEvent(new MouseEvent("click"));
          }}
        >
          <input
            type="file"
            id="search-avatar-file"
            name="search-avatar-file"
            accept="image/png, image/jpeg"
            ref={input} // On dit a quel useRef faire référence
          />
        </div>
      </form>
    </>
  );
}

/* 
Utilisation d'une interface AvatarProps pour que ce soit plus clair
et pour éviter d'ecrire ça:
  export default function Avatar({ id }: { id: string | undefined }) {}
*/

//Utiliser <input type="//file"> pour chercher une image en local  et la selectionner
//puis envoyer l'event onChange qui contient l'image au Back.

/*
    --- Pour la partie upload une photo de profile: ---
- Selectionner un fichier depuis le gestionnaire de fichier,
- Recuperer raw data de l'image,
Trouver un package qui upload et retourne la raw data.

- Puis faire un POST a notre serveur sur /image pour lui envoyer l'image raw
- Puis le serveur il recoit les données de l'image, les sauvegardent de son cote et creer une url,
- Puis il va repondre avec l'url de l'image qu'il vient de creer.

- Ensuite PUT sur le /user/profile l'url du nouvel avatar. 
Repréciser toutes les infos même celles non modifiées.
- window.location.reload() => a faire pour reload la page et afficher ainsi le bon avatar.
*/
