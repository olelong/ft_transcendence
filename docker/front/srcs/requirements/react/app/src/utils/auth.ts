const LS_KEY_42API = "42-tokens";

export default function manage42APILogin(setLogin: React.Dispatch<React.SetStateAction<string>>) {
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
      refreshToken(setLogin);
      throw new Error("refresh");
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
    .catch((err) => console.error(err));
}

function getTokenWithUrlCode(
  setLogin: React.Dispatch<React.SetStateAction<string>>
) {
  let params = new URL(window.location.href).searchParams;
  let code = params.get("code");

  /* This part avoids minor errors due to React.StrictMode */
  if (!localStorage.getItem("code"))
    localStorage.setItem("code", JSON.stringify(code));
  else {
    localStorage.removeItem("code");
    return;
  }
  /* ***************************************************** */

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
    .catch((err) => console.error(err));
}
