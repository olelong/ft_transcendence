import { useState } from "react";

import Form from "react-bootstrap/Form";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/EditNameChannel.css";

import valid from "../../../assets/icons/valid.png";

export default function EditNameChannel({
  channelName,
  setChannelName,
}: {
  channelName: string | undefined;
  setChannelName: (newValue: string) => void;
}) {
  const [userInput, setUserInput] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string | "">("");
  const [channelNameMsgErr, setChannelNameMsgErr] = useState<string | "">("");

  // Pour retirer le message d'erreur de pattern de l'input par défaut
  // du navigateur:
  let inputTest = document.getElementById("channel-name");
  if (inputTest) {
    inputTest.addEventListener(
      "invalid",
      function (e) {
        e.preventDefault();
      },
      true
    );
  }

  return (
    <Form
      className="channel-name-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (userInput.length === 0) setInputMessage("");
        else setChannelName(userInput);
      }}
    >
      <label className="channel-name-label">
        Channel's name:
        <input
          type="text"
          id="channel-name"
          name="channel-name-input"
          value={userInput}
          autoComplete="off"
          pattern="^[\w -]{2,30}$"
          placeholder={channelName ? channelName : "Enter name"}
          onChange={(e) => {
            setUserInput(e.target.value);
            setChannelNameMsgErr("");
          }}
        />
        {channelNameMsgErr && (
          <div className="channel-name-error-message">{channelNameMsgErr}</div>
        )}
      </label>

      <button
        type="submit"
        className="channel-name-button"
        onClick={() => {
          if (!/^[\w -]{2,30}$/.test(userInput)) {
            setChannelNameMsgErr(
              "Invalid name. Use letters, spaces, numbers, _, and -. Min 2, max 30 chars."
            );
            setInputMessage("");
          } else {
            setChannelNameMsgErr("Valid Name");
            setInputMessage("");
          }
        }}
      >
        <img src={valid} alt="Icon for validate name input" className="valid-name-img" />
      </button>
      <p className="input-message-channel-name">{inputMessage}</p>
    </Form>
  );
}
