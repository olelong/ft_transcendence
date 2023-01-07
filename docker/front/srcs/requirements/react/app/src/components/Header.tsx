import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";

export default function Header() {
  // if "catpong" exists in localStorage so login is equal login (ex: ytak)
  // else login is equal to null/undefined
  const [login, setLogin] = useState(
    localStorage.getItem("catpong") &&
      JSON.parse(localStorage.getItem("catpong") || "[]").login
  );

  useEffect(() => {
    if (!login) {
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
          window.location.href = "/login";
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
  }, [login]);

  return (
    <div>
      <Link to="/home/profile">Profile</Link>
      <Link to="/home/play">Play</Link>
      <Link to="/home/chat">Chat</Link>
      <h2>"This is the header!"</h2>
      <h2>"The logged login is:"{login}</h2>
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
        refreshToken(refresh_token, () => getUserInfos(setLogin));
        throw new Error("ignore");
      }
    })
    .then((data) => {
      if (data) {
        setLogin(data.login);
        console.log(data);
      }
    })
    .catch((err) => {
      if (err.message !== "ignore") console.error(err);
    });
}

function refreshToken(refresh_token: string, end_function: () => void): void {
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
      end_function();
    })
    .catch((err) => console.error(err));
}
