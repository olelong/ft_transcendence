//import { useState } from "react";
//import { useEffect } from "react";
//import Tab from "react-bootstrap/Tab";

//import Tabs from "react-bootstrap/Tabs";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/Tabs.css";

export default function Tabs() {
  return (
    /*
    <Tabs>
      <Tab title="Achievements" eventKey="achievements">
        <Achievements />
      </Tab>
      <Tab title="History Games" eventKey="history">
        <History />
      </Tab>
      <Tab title="Friends Blocked" eventKey="friends">
        <Blocked />
      </Tab>
    </Tabs>*/
    <p></p>
  );
}
/* eventKey="", Permet de séparer les onglets les un des autres*/

/*
Notes:
Commencer par la liste des personnes bloqués car il 
faut recuperer la liste, afficher un avatar, l'id et un bouton debloquer.

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
