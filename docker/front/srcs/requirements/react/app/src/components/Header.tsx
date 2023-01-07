import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";

export default function Header() {
  const [login, setLogin] = useState("");

  useEffect(() => {
    if (
      window.location.href.startsWith(process.env.REACT_APP_REDIRECT_URI || "")
    ) {
      let params = new URL(window.location.href).searchParams;
      let code = params.get("code");
      fetch("https://api.intra.42.fr/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.REACT_APP_UID,
          client_secret: process.env.REACT_APP_SECRET,
          code: code,
          redirect_uri: process.env.REACT_APP_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      })
        .then((res) => {
          if (res.status === 200) return res.json();
          const ls = JSON.parse(localStorage.getItem("catpong") || "[]");
          if (ls.length !== 0 && ls.tokens) throw new Error("Token exists");
          throw new Error("access_token request failed");
        })
        .then(({ access_token, refresh_token }) => {
          localStorage.setItem(
            "catpong",
            JSON.stringify({ tokens: { access_token, refresh_token } })
          );
          throw new Error("Token exists");
        })
        .catch((err) => {
          if (err.message === "Token exists") getUserInfos(setLogin);
          else console.error(err);
        });
    }
  }, []);

  return (
    <div>
      <Link to="/home/profile">Profile</Link>
      <Link to="/home/play">Play</Link>
      <Link to="/home/chat">Chat</Link>
      <p>{login}</p>
      <Outlet />
    </div>
  );
}

function getUserInfos(setLogin: React.Dispatch<React.SetStateAction<string>>) {
  const { access_token, refresh_token } = JSON.parse(
    localStorage.getItem("catpong") || "[]"
  ).tokens;
  fetch("https://api.intra.42.fr/v2/me", {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  })
    .then((res) => {
      if (res.status === 200) return res.json();
      else if (res.status === 401) {
        fetch("https://api.intra.42.fr/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.REACT_APP_UID,
            client_secret: process.env.REACT_APP_SECRET,
            refresh_token: refresh_token,
            redirect_uri: process.env.REACT_APP_REDIRECT_URI,
            grant_type: "refresh_token",
          }),
        })
          .then((res) => res.json())
          .then((access_token) => {
            localStorage.setItem(
              "catpong",
              JSON.stringify({ tokens: { access_token, refresh_token } })
            );
            getUserInfos(setLogin);
          })
          .catch((err) => console.error(err));
        throw new Error("ignore");
      }
    })
    .then((data) => {
      setLogin(data.login);
    })
    .catch((err) => {
      if (err.message !== "ignore") console.error(err);
    });
}
