import { useState } from "react";

import Form from "react-bootstrap/Form";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/EditNameChannel.css";

export default function EditNameChannel({
  channelName,
  setChannelName,
}: {
  channelName: string | undefined;
  setChannelName: (newValue: string | undefined) => void;
}) {
  const [userInput, setUserInput] = useState<string>("");
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
    <Form className="channel-name-form">
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
            if (e.target.value.length === 0) {
              setChannelNameMsgErr("");
              setChannelName(channelName);
            } else if (!/^[\w -]{2,30}$/.test(e.target.value)) {
              setChannelNameMsgErr(
                "Invalid name. Use letters, spaces, numbers, _, and -. Min 2, max 30 chars."
              );
              setChannelName(undefined);
            } else {
              setChannelNameMsgErr("");
              setChannelName(e.target.value);
            }
          }}
        />
        {channelNameMsgErr && (
          <div className="channel-name-error-message">{channelNameMsgErr}</div>
        )}
      </label>
    </Form>
  );
}
