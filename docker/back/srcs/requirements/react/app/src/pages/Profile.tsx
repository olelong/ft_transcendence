import { useState, useEffect } from "react";

import { serverUrl } from "index";

import Cookies from "js-cookie";

export default function Profile() {
  const [qrUrl, setQrUrl] = useState(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaValid, setTfaValid] = useState(null);

  useEffect(() => {
    if (tfaValid === true) {
      alert("TFA activated");
      setQrUrl(null);
    }
  }, [tfaValid]);

  const changeTfa = (on: boolean) => {
    fetch(serverUrl + "user/profile", {
      credentials: "include",
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tfa: on }),
    })
      .then((res) => res.json())
      .then(({ ok, tfa }) => {
        if (ok) alert("TFA deactivated");
        if (tfa) setQrUrl(tfa);
      });
  };

  const checkTfaCode = (code: string) => {
    fetch(serverUrl + "user/profile/tfavalidation", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then(({ valid }) => setTfaValid(valid))
      .catch(console.error);
  };

  return (
    <>
      <h1>Profile</h1>
      <div
        style={{
          position: "absolute",
          left: 500,
          top: 500,
          transform: "translate(-50%, -50%)",
        }}
      >
        <button onClick={() => changeTfa(true)}>Activate TFA</button>
        <button onClick={() => changeTfa(false)}>Deactivate TFA</button>
        {qrUrl && (
          <>
            <img
              src={qrUrl}
              alt="tfa qrcode"
              height={250}
            />
            <input onChange={(e) => setTfaCode(e.target.value)} />
            <button
              onClick={() => {
                setTfaValid(null);
                checkTfaCode(tfaCode);
              }}
            >
              Confirm
            </button>
            {tfaValid === false && <p style={{ color: "red" }}>Invalid code</p>}
          </>
        )}
      </div>
    </>
  );
}
