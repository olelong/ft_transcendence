import { useState } from "react";

import Form from "react-bootstrap/Form";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/EditPasswordChannel.css";

import valid from "../../../assets/icons/valid.png";

export default function EditPasswordChannel({
  channelType,
  channelPassword,
  setChannelPassword,
}: {
  channelType: string;
  channelPassword: string | undefined;
  setChannelPassword: (newValue: string) => void;
}) {
  const [userInput, setUserInput] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string | "">("");
  const [channelPasswordMsgErr, setChannelPasswordMsgErr] = useState<
    string | ""
  >("");
  const passRegex = /^(?=.*[A-Z])(?=.*[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/ ])(?=.*[0-9])(?=.*[a-z]).{8,}$/;

  // Pour retirer le message d'erreur de pattern de l'input par défaut
  // du navigateur:
  let inputTest = document.getElementById("channel-password");
  if (inputTest) {
    inputTest.addEventListener(
      "invalid",
      function (e) {
        e.preventDefault();
      },
      true
    );
  }

  if (channelType === "protected") {
    return (
      <Form
        className="channel-password-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (userInput.length === 0) setInputMessage("");
          else setChannelPassword(userInput);
        }}
      >
        <label className="channel-password-label">Enter a password:</label>
        <input
          type="text"
          id="channel-password"
          name="channel-password-input"
          value={userInput}
          autoComplete="off"
          pattern={passRegex.toString()}
          placeholder="Enter Password"
          onChange={(e) => {
            setUserInput(e.target.value);
            setChannelPasswordMsgErr("");
          }}
          required
        />
        {channelPasswordMsgErr && (
          <div className="channel-password-error-message">
            {channelPasswordMsgErr}
          </div>
        )}
        <button
          type="submit"
          className="channel-password-button"
          onClick={() => {
            if (!passRegex.test(userInput)) {
              setChannelPasswordMsgErr(
                "Password must contain at least 8 characters, including at least 1 lowercase, 1 uppercase, 1 digit, and 1 special character."
              );
              setInputMessage("");
            } else {
              setChannelPasswordMsgErr("Valid Password");
              setInputMessage("");
            }
          }}
        >
          <img
            src={valid}
            alt="Icon for validate Password input"
            className="valid-password-img"
          />
        </button>
        <p className="input-message-channel-password">{inputMessage}</p>
      </Form>
    );
  } else {
    setChannelPassword("");
    return <></>;
  }
}
