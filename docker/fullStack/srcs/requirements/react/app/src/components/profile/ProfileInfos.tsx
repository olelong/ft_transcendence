import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/Profile.css";

import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FormLabel from "react-bootstrap/FormLabel";
import Switch from "react-switch";
import Select from "react-select";

import addFriend from "../../assets/icons/add_friend.png";
import rmFriend from "../../assets/icons/rm_friend.png";
import valid from "../../assets/icons/valid.png";
import decline from "../../assets/icons/decline.png";
import score from "../../assets/icons/score.png";
import star from "../../assets/icons/star.png";

import { serverUrl } from "index";
import {
  AddFriendProps,
  InviteFriendProps,
  ProfileInfosProps,
  User,
} from "types/profile.interface";

function InviteFriend({
  userInfosId,
  login,
  setInvitationSent,
  invitationSent,
}: InviteFriendProps) {
  fetch(serverUrl + "/user/friends/" + userInfosId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ add: !invitationSent }),
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok === true) setInvitationSent(!invitationSent);
      //console.log("invitation:", !invitationSent);
    })
    .catch((err) => console.error(err));
}

function AddFriend({
  userInfosId,
  login,
  setIsMyFriend,
  isMyFriend,
}: AddFriendProps) {
  fetch(serverUrl + "/user/friends/" + userInfosId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ add: !isMyFriend }),
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok === true) setIsMyFriend(!isMyFriend);
      //console.log("isMyFriend:", !isMyFriend);
    })
    .catch((err) => console.error(err));
}

export function BlockAUser(
  userInfosId: any,
  block: boolean,
  blockedList?: User[],
  setBlockedList?: React.Dispatch<React.SetStateAction<User[] | undefined>>
) {
  fetch(serverUrl + "/user/blocks/" + userInfosId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ add: block }),
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (
        data.ok === true &&
        block === false &&
        blockedList !== undefined &&
        setBlockedList !== undefined
      ) {
        const newBlockedList = [...blockedList];
        const index = newBlockedList.findIndex(
          (blocked) => blocked.id === userInfosId
        );
        newBlockedList.splice(index, 1);
        setBlockedList(newBlockedList);
      }
    })
    .catch((err) => console.error(err));
}

// Afficher les infos du user:
export default function ProfileInfos({
  login,
  setUserInfos,
  userInfos,
  isMyProfilePage,
  setIsBlocked,
}: ProfileInfosProps) {
  const [inputMessage, setInputMessage] = useState<string | "">("");
  const [displayNameMsgErr, setDisplayNameMsgErr] = useState<string | "">("");
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
      })
      .catch((err) => console.error(err));
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
        else setTfaInputErrorMessage("Invalid code");
        setTfaValid(valid);
      })
      .catch(console.error);
  };

  const [checkedSwitch, setCheckedSwitch] = useState<boolean>();
  const [tfaInputErrorMessage, setTfaInputErrorMessage] = useState("");
  const [tfaPopupVisibility, setTfaPopupVisibility] = useState(true);

  useEffect(() => setCheckedSwitch(userInfos && userInfos.tfa), [userInfos]);

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
      if (!/^\d{6}$/.test(tfaCode)) {
        setTfaInputErrorMessage("Incorrect code, please enter a 6-digit code.");
      } else {
        checkTfaCode(tfaCode);
      }
    }
  };

  const [hasntPlayedYet, setHasntPlayedYet] = useState<boolean>();
  const [winRateDisplayable, setWinRateDisplayable] = useState(0);
  useEffect(() => {
    if (
      userInfos &&
      typeof userInfos.stats.wins === "number" &&
      typeof userInfos.stats.loses === "number"
    ) {
      if (userInfos.stats.rank === 0) {
        setHasntPlayedYet(true);
      } else {
        const winRate = userInfos.stats.wins / userInfos.stats.loses;
        setWinRateDisplayable(Math.round(winRate * 100));
        setHasntPlayedYet(false);
        setThemeGame(userInfos.theme);
      }
    }
  }, [userInfos]);
  /*Cas de rank 0 : joueur n'a pas encore joué: affichage "jouer pour avoir des stats" */

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
  };

  /* Cote invitation amis etc : */

  const [isMyFriend, setIsMyFriend] = useState(false); // True if it's my friend
  // Check if the user is our friend
  useEffect(() => {
    if (userInfos) {
      fetch(serverUrl + "/user/friends/" + userInfos.id, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setIsMyFriend(data.ok);
        })
        .catch((err) => console.error(err));
    }
  }, [userInfos]);

  const [pendingFriend, setPendingFriend] = useState<boolean>();
  useEffect(() => {
    if (!isMyFriend && userInfos) {
      fetch(serverUrl + "/user/friends", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          //console.log("pending pls", data);
          setPendingFriend(false);
          if (data.pending.some((p: any) => p.id === userInfos.id)) {
            //console.log("User is pending friend");
            // On cherche si dans la liste des users pendings il y a l'id du user dont on regarde le profile
            setPendingFriend(true);
          }
        })
        .catch(console.error);
    }
  }, [isMyFriend, userInfos]);

  const firstCap = (str: string | undefined): string | undefined => {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
  };

  const [invitationSent, setInvitationSent] = useState<boolean>(false);

  return (
    <Container
      className={
        isMyProfilePage === true ? "profile-infos" : "profile-infos-other"
      }
    >
      <p className="profile-id">{userInfos && userInfos.id}</p>
      {isMyProfilePage === false && (
        <>
          <div className="friend-displayname">
            <p>{userInfos && userInfos.name}</p>
          </div>
          {!isMyFriend && !pendingFriend && (
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
                    InviteFriend({
                      userInfosId: userInfos?.id || "",
                      login,
                      setInvitationSent,
                      invitationSent,
                    });
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
              <button
                type="submit"
                style={{ height: "40px" }}
                className="block-friend-button"
                onClick={(e: any) => {
                  e.preventDefault();
                  setIsBlocked(true);
                  BlockAUser(userInfos.id, true);
                }}
              >
                Block
              </button>
            </div>
          )}
          {!isMyFriend && invitationSent && (
            <p id="invitation-sent-p">Invitation sent</p>
          )}
          {!isMyFriend && pendingFriend && (
            <div className="pending-friend">
              <div className="pending-friend-title">
                <p>Invitation pending</p>
              </div>
              <Form
                className="pending-friend-form-button"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <button
                  type="submit"
                  className="accept-friend-button"
                  onClick={(e: any) => {
                    AddFriend({
                      userInfosId: userInfos?.id || "",
                      login,
                      setIsMyFriend,
                      isMyFriend,
                    });
                    setPendingFriend(false);
                    setInvitationSent(false);
                    e.preventDefault();
                  }}
                >
                  <img
                    src={valid}
                    className="pending-friend-imgs"
                    alt="Accept invitation picto"
                  />
                </button>
                <button
                  type="submit"
                  className="decline-friend-button"
                  onClick={(e: any) => {
                    AddFriend({
                      userInfosId: userInfos?.id || "",
                      login,
                      setIsMyFriend,
                      isMyFriend: true,
                    });
                    setPendingFriend(false);
                    setInvitationSent(false);
                    e.preventDefault();
                  }}
                >
                  <img
                    src={decline}
                    className="pending-friend-imgs"
                    alt="Decline invitation picto"
                  />
                </button>
              </Form>
              <button
                type="submit"
                style={{ height: "40px" }}
                className="block-friend-button"
                onClick={(e: any) => {
                  e.preventDefault();
                  setIsBlocked(true);
                  BlockAUser(userInfos.id, true);
                }}
              >
                Block
              </button>
            </div>
          )}
          {isMyFriend && !pendingFriend && (
            <>
              <div className="rm-friend-global">
                <div className="rm-friend">
                  <div className="rm-friend-title">
                    <p>Remove friend</p>
                  </div>
                  <button
                    type="submit"
                    className="rm-friend-button"
                    onClick={(e: any) => {
                      //setIsAddingFriend(false);
                      AddFriend({
                        userInfosId: userInfos?.id || "",
                        login,
                        setIsMyFriend,
                        isMyFriend,
                      });
                      e.preventDefault();
                    }}
                  >
                    <img
                      src={rmFriend}
                      alt="Remove friend picto"
                      style={{
                        width: "25px",
                        padding: "3px",
                      }}
                    />
                  </button>
                </div>
                <button
                  style={{ left: "80px" }}
                  type="submit"
                  className="block-friend-button"
                  onClick={(e: any) => {
                    e.preventDefault();
                    setIsBlocked(true);
                    BlockAUser(userInfos.id, true);
                  }}
                >
                  Block
                </button>
              </div>
              <strong className="profile-are-friend-p">
                {" "}
                You are friends{" "}
              </strong>
            </>
          )}
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
              if (!/^\d{6}$/.test(tfaCode)) {
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
      {hasntPlayedYet === false && (
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
      )}
      {hasntPlayedYet === true && (
        <Container className="profile-stats-hasnt-played">
          <div>
            <p>
              <img
                src={star}
                alt="rank's icon"
                className="profile-rank-star-first"
              />
              <strong>Player hasn't played yet</strong>
              <img
                src={star}
                alt="rank's icon"
                className="profile-rank-star-last"
              />
              <br />
            </p>
          </div>
        </Container>
      )}
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
}
