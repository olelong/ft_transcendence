import { useRef, useState, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/Avatar.css";

import { AvatarProps } from "../../types/profile.interface";

import CatPongImage from "../../components/CatPongImage";

import { serverUrl } from "index";

export default function Avatar({
  id,
  userInfos,
  isMyProfilePage,
  isBlocked,
}: AvatarProps) {

  // On met dans une variable appelée input, un tag html
  const input = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileRes, setAvatarFileRes] = useState<string>(
    userInfos && userInfos.avatar
  );

  // Request Post to upload an image:
  useEffect(() => {
    if (avatarFile) {
      const formData = new FormData();
      formData.append("image", avatarFile);
      fetch(serverUrl + "/image", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data) setAvatarFileRes(data.url);
        })
        .catch((err) => console.error(err));
    }
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
        if (res.status >= 200 && res.status < 300) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => {})
      .catch((err) => console.error(err));
  }, [avatarFileRes]);

  return (
    <>
      {(isBlocked === false || isMyProfilePage === true) && (
        <div className="profile-avatar-circle">
          <CatPongImage
            user={{
              name: userInfos?.name,
              avatar: avatarFileRes
                ? avatarFileRes
                : userInfos && userInfos.avatar && userInfos.avatar,
            }}
            style={{ maxWidth: "none", maxHeight: "none" }}
          />
        </div>
      )}
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

/* Utiliser <input type="//file"> pour chercher une image en local  et la selectionner
puis envoyer l'event onChange qui contient l'image au Back.*/

