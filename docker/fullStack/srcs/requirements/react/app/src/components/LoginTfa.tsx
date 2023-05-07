import { useState } from "react";

import logo from "../assets/main/pictoGrand.png";

export default function LoginTfa({
  tfaValid,
  setTfaValid,
  loginWithTfa,
}: LoginTfaProps) {
  const [tfaCode, setTfaCode] = useState("");
  const [tfaInputErrorMsg, setTfaInputErrorMsg] = useState<string>();

  return (
    <div className="tfa-login-global">
      <div className="tfa-login-global-shadow">
        <div className="tfa-logo-div">
          <img src={logo} alt="CatPong's logo" className="tfa-picto" />
          <h1 className="tfa-logoName">CATPONG</h1>
        </div>
        <div className="tfa-input-div">
          <p className="tfa-input-title">
            Connection with Two Factor Authentification
          </p>
          <input
            pattern="^[\d]{6}$"
            autoComplete="off"
            placeholder="  Code"
            className="tfa-login-input"
            onChange={(e) => {
              setTfaInputErrorMsg("");
              setTfaCode(e.target.value);
            }}
          />
          <button
            className="tfa-button-login"
            onClick={() => {
              setTfaValid(null);
              if (!/^\d{6}$/.test(tfaCode)) {
                setTfaInputErrorMsg("Please enter a 6-digit code.");
              } else loginWithTfa(tfaCode);
            }}
          >
            Login
          </button>
        </div>
        <div className="tfa-button-back-to-login-div">
          <button
            className="tfa-button-back-to-login"
            onClick={() => (window.location.href = "/login")}
          >
            Back to log in
          </button>
        </div>
        {tfaInputErrorMsg && (
          <p className="tfa-login-error-msg">{tfaInputErrorMsg}</p>
        )}
        {tfaValid === false && (
          <p className="tfa-login-error-msg">Invalid code</p>
        )}
      </div>
    </div>
  );
}
