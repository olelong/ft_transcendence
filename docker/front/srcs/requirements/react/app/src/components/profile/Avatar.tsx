import "bootstrap/dist/css/bootstrap.min.css";

import "../../styles/profile/Avatar.css";
import { AvatarProps } from "../../types/profile.interface";

import { useRef, useState, useEffect } from "react";
import { serverUrl } from "index";

export default function Avatar({
  id,
  userInfos,
  isMyProfilePage,
}: AvatarProps) {
  //export default function Avatar({ id }: AvatarProps, { userInfos }: any) {
  // Verifier que l'id soit undefined ou non pour
  // savoir si on est sur la page profile du user ou d'un autre
  //console.log(window.innerWidth);
  //console.log(window.innerHeight);

  // On met dans une variable appelée input, un tag html
  const input = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileRes, setAvatarFileRes] = useState<string>("");

  // Request Post to upload an image:
  useEffect(() => {
    if (avatarFile) {
      const formData = new FormData();
      formData.append("image", avatarFile);
      fetch(serverUrl + "/image", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data) setAvatarFileRes(data.url);
          //console.log("post data:", data);
        })
        .catch((err) => console.error(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarFile]);

  // Request Put to update avatar image:
  // Changer les informations du user:
  useEffect(() => {
    fetch(serverUrl + "/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatar: avatarFileRes,
      }),
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        //console.log("put data:", data);
        //console.log("avatarFileRes:", avatarFileRes);
      })
      .catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarFileRes]);

  return (
    <>
      <div className="profile-avatar-circle">
        <img
          src={
            avatarFileRes
              ? serverUrl + avatarFileRes
              : userInfos && userInfos.avatar && serverUrl + userInfos.avatar
          }
          alt="Profile user's avatar"
          className="profile-avatar"
        />
      </div>

      {isMyProfilePage && (
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
              accept="image/png, image/jpeg"
              ref={input} // On dit a quel useRef faire référence
              onChange={(e) =>
                setAvatarFile(e.target.files && e.target.files[0])
              }
            />
          </div>
        </form>
      )}
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
