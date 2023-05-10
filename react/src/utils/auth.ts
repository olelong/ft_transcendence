import { serverUrl } from "../index";
import Cookies from "js-cookie";

export const LS_KEY_42API = "42-tokens";
export const LS_KEY_LOGIN = "login";
export const COOKIE_KEY = "token";
export const LOGIN_TOO_MUCH_REQUESTS = "$[TOO_MUCH_REQUESTS]$";

export function manage42APILogin(
  setLogin: React.Dispatch<React.SetStateAction<string>>
) {
  if (localStorage.getItem(LS_KEY_42API)) getLogin(setLogin);
  else getTokenWithUrlCode(setLogin);
}

function getLogin(setLogin: React.Dispatch<React.SetStateAction<string>>) {
  const access_token = JSON.parse(
    localStorage.getItem(LS_KEY_42API) || "{}"
  ).access_token;

  fetch("https://api.intra.42.fr/v2/me", {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  })
    .then((res) => {
      if (res.status === 200) return res.json();
      if (res.status === 429) {
        setLogin(LOGIN_TOO_MUCH_REQUESTS);
        throw new Error("Too much requests!");
      } else if (res.status === 401) {
        refreshToken(setLogin);
        throw new Error("refresh");
      } else throw new Error(res.statusText);
    })
    .then((data) => {
      if (data) setLogin(data.login);
    })
    .catch((err) => {
      if (err.message !== "refresh") console.error(err);
    });
}

function refreshToken(
  setLogin: React.Dispatch<React.SetStateAction<string>>
): void {
  const refresh_token = JSON.parse(
    localStorage.getItem(LS_KEY_42API) || "{}"
  ).refresh_token;

  localStorage.removeItem(LS_KEY_42API);

  fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.REACT_APP_UID,
      client_secret: process.env.REACT_APP_SECRET,
      redirect_uri: process.env.REACT_APP_REDIRECT_URI,
      refresh_token: refresh_token,
      grant_type: "refresh_token",
    }),
  })
    .then((res) => {
      if (res.status === 200) return res.json();
      if (res.status === 429) {
        setLogin(LOGIN_TOO_MUCH_REQUESTS);
        throw new Error("Too much requests!");
      }
      window.location.href = "/login";
      throw new Error("Refresh failed: Token revoked");
    })
    .then(({ access_token, refresh_token: new_refresh_token }) => {
      localStorage.setItem(
        LS_KEY_42API,
        JSON.stringify({
          access_token,
          refresh_token: new_refresh_token || refresh_token,
        })
      );
      getLogin(setLogin);
    })
    .catch(console.error);
}

function getTokenWithUrlCode(
  setLogin: React.Dispatch<React.SetStateAction<string>>
) {
  let params = new URL(window.location.href).searchParams;
  let code = params.get("code");

  if (!code) {
    console.error("No code in the URL");
    window.location.href = "/login";
  }
  fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.REACT_APP_UID,
      client_secret: process.env.REACT_APP_SECRET,
      redirect_uri: process.env.REACT_APP_REDIRECT_URI,
      code: code,
      grant_type: "authorization_code",
    }),
  })
    .then((res) => {
      if (res.status === 200) return res.json();
      if (res.status === 429) {
        setLogin(LOGIN_TOO_MUCH_REQUESTS);
        throw new Error("Too much requests!");
      }
      window.location.href = "/login";
      throw new Error("access_token request failed");
    })
    .then(({ access_token, refresh_token }) => {
      localStorage.setItem(
        LS_KEY_42API,
        JSON.stringify({ access_token, refresh_token })
      );
      getLogin(setLogin);
    })
    .catch(console.error);
}

export function serverLogin(
  setTfaRequired: React.Dispatch<React.SetStateAction<boolean | null>>
): void {
  fetch(serverUrl + "/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: JSON.parse(localStorage.getItem(LS_KEY_42API) || "{}")
        .access_token,
    }),
  })
    .then((res) => {
      if (res.status >= 400) window.location.href = "/login";
      else return res.json();
    })
    .then((data) => {
      setTfaRequired(data.tfaRequired);
      if (!data.tfaRequired)
        Cookies.set(COOKIE_KEY, data.token, cookiesOptions);
      if (data.newUser) window.location.href = "/home/profile";
    })
    .catch(console.error);
}

export function loginWithTfa(
  code: string,
  setTfaValid: React.Dispatch<React.SetStateAction<boolean | null>>
): void {
  fetch(serverUrl + "/user/login/tfa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: JSON.parse(localStorage.getItem(LS_KEY_42API) || "{}")
        .access_token,
      tfa: code,
    }),
  })
    .then((res) => {
      if (res.status >= 400) {
        if (res.status === 401) setTfaValid(false);
        throw new Error(res.statusText);
      }
      setTfaValid(true);
      return res.json();
    })
    .then((data) => Cookies.set(COOKIE_KEY, data.token, cookiesOptions))
    .catch(console.error);
}

export function getLoginInLS(
  setLogin: React.Dispatch<React.SetStateAction<string>>
) {
  const login = localStorage.getItem(LS_KEY_LOGIN);
  if (!login) return false;
  setLogin(login);
  return true;
}

export const cookiesOptions = {
  expires: 1,
  sameSite: "none",
  domain: extractDomain(
    process.env.REACT_APP_SERVER_URL || "http://localhost:3001"
  ),
  secure: process.env.NODE_ENV === "production",
};

function extractDomain(url: string): string {
  let domain;
  if (url.indexOf("://") > -1) domain = url.split("/")[2];
  else domain = url.split("/")[0];

  domain = domain.split(":")[0];

  return domain;
}
