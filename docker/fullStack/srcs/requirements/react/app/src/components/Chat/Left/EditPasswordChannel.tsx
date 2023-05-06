import { useState } from "react";

import Form from "react-bootstrap/Form";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/EditPasswordChannel.css";

export default function EditPasswordChannel({
  channelPassword,
  setChannelPassword,
}: {
  channelPassword: string | undefined | null;
  setChannelPassword: (newValue: string | undefined | null) => void;
}) {
  const [userInput, setUserInput] = useState<string>("");
  const [channelPasswordMsgErr, setChannelPasswordMsgErr] = useState<
    string | ""
  >("");
  const passRegex =
    /^(?=.*[A-Z])(?=.*[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/ ])(?=.*[0-9])(?=.*[a-z]).{8,}$/;

  //console.log("channelPassword:", channelPassword);

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

  return (
    <Form className="channel-password-form">
      <label className="channel-password-label">Enter a password:</label>
      <input
        type="password"
        id="channel-password"
        name="channel-password-input"
        value={userInput}
        autoComplete="off"
        pattern={passRegex.toString()}
        placeholder="Enter Password"
        onChange={(e) => {
          setUserInput(e.target.value);
          if (e.target.value.length === 0) {
            setChannelPasswordMsgErr("");
            //console.log(channelPassword);
            setChannelPassword(channelPassword);
          } else if (!passRegex.test(e.target.value)) {
            setChannelPasswordMsgErr(
              "Password must contain at least 8 characters, including at least 1 lowercase, 1 uppercase, 1 digit, and 1 special character."
            );
            setChannelPassword(undefined);
          } else {
            setChannelPasswordMsgErr("");
            setChannelPassword(e.target.value);
          }
        }}
        required
      />
      {channelPasswordMsgErr && (
        <div className="channel-password-error-message">
          {channelPasswordMsgErr}
        </div>
      )}
    </Form>
  );
}
