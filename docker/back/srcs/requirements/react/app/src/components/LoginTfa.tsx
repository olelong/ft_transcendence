import { useState } from "react";

export default function LoginTfa({
  tfaValid,
  setTfaValid,
  loginWithTfa,
}: LoginTfaProps) {
  const [tfaCode, setTfaCode] = useState("");

  return (
    <div style={{ position: "relative", top: 500 }}>
      <input onChange={(e) => setTfaCode(e.target.value)} />
      <button
        onClick={() => {
          setTfaValid(null);
          loginWithTfa(tfaCode);
        }}
      >
        Login
      </button>
      <button onClick={() => (window.location.href = "/login")}>
        Back to log in
      </button>
      {tfaValid === false && <p style={{ color: "red" }}>Invalid code</p>}
    </div>
  );
}
