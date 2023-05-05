import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useState } from "react";
import Cookies from "js-cookie";

import { serverUrl } from "../index";
import { COOKIE_KEY, LS_KEY_LOGIN } from "../utils/auth";

import "../styles/ClassicLogin.css";

type SubmitFn = (
  e: React.FormEvent<HTMLFormElement>,
  login: string,
  password: string,
  setLoad: React.Dispatch<React.SetStateAction<boolean>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => void;

export default function ClassicLogin({
  setLoginWithTfa,
  setTfaValid,
}: {
  setLoginWithTfa: React.Dispatch<
    React.SetStateAction<((tfaCode: string) => void) | undefined>
  >;
  setTfaValid: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
  const MyForm = ({ onSubmit }: { onSubmit: SubmitFn }) => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [load, setLoad] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Pour retirer le message d'erreur de pattern de l'input par défaut
    // du navigateur:
    let inputTest = document.getElementById("classic-login");
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
      <Form
        onSubmit={(e) => {
          setLoad(true);
          onSubmit(e, login, password, setLoad, setErrorMessage);
        }}
      >
        {!load ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Login</Form.Label>
              <Form.Control
                id="classic-login"
                name="classic-login-input"
                placeholder="Enter your username"
                value={login}
                pattern="^[\w-]{2,30}$"
                autoComplete="off"
                onChange={(e) => setLogin(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                id="classic-login"
                name="classic-login-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                autoComplete="off"
                onChange={(e) => setPassword(e.target.value)}
              />
              <p style={{ color: "var(--white)", fontSize: "11px" }}>
                {errorMessage}
              </p>
            </Form.Group>
            <Button variant="primary" type="submit" className="button">
              Submit
            </Button>{" "}
          </>
        ) : (
          <Spinner variant="info" className="spinner" />
        )}
      </Form>
    );
  };

  const login: SubmitFn = (e, login, password, setLoad, setErrorMessage) => {
    e.preventDefault();
    fetch(serverUrl + "/user/classic/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    })
      .then((res) => {
        if (res.status === 401) setErrorMessage("Incorrect login/password");
        else if (res.status >= 200 && res.status < 300) return res.json();
        else setErrorMessage("Incorrect login/password");
        setLoad(false);
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => {
        if (data) {
          if (!data.tfaRequired) {
            Cookies.set(COOKIE_KEY, data.token, {
              expires: 1,
              sameSite: "strict",
            });
            window.location.href = "/home/play";
            localStorage.setItem(LS_KEY_LOGIN, "$" + login);
          } else
            setLoginWithTfa(() => (tfaCode: string) => {
              fetch(serverUrl + "/user/classic/login/tfa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password, tfa: tfaCode }),
              })
                .then((res) => {
                  if (res.status >= 400) {
                    if (res.status === 401) setTfaValid(false);
                    throw new Error(res.statusText);
                  }
                  return res.json();
                })
                .then((data) => {
                  Cookies.set(COOKIE_KEY, data.token, {
                    expires: 1,
                    sameSite: "strict",
                  });
                  localStorage.setItem(LS_KEY_LOGIN, "$" + login);
                  setTfaValid(true);
                })
                .catch(console.error);
            });
        }
      })
      .catch(console.error);
  };
  const signup: SubmitFn = (e, login, password, setLoad, setErrorMessage) => {
    e.preventDefault();
    fetch(serverUrl + "/user/classic/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    })
      .then((res) => {
        if (res.status === 400)
          setErrorMessage(
            "The password must contain at least 8 characters, including at least 1 lowercase, 1 uppercase, 1 digit, and 1 symbol. The login must be between 2 and 30 characters in length."
          );
        else if (res.status === 401)
          setErrorMessage("This login already exists, please choose another.");
        else if (res.status >= 200 && res.status < 300) return res.json();
        else setErrorMessage("Incorrect Login/Password.");
        setLoad(false);
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => {
        if (data?.token)
          Cookies.set(COOKIE_KEY, data.token, {
            expires: 1,
            sameSite: "strict",
          });
        window.location.href = "/home/profile";
        localStorage.setItem(LS_KEY_LOGIN, "$" + login);
      })
      .catch(console.error);
  };

  return (
    <div className="classic-login-global">
      <Tabs className="classic-login-tabs" justify>
        <Tab title="Log in" className="classic-login-tab" eventKey="login">
          <MyForm onSubmit={login} />
        </Tab>
        <Tab title="Sign up" className="classic-login-tab" eventKey="signup">
          <MyForm onSubmit={signup} />
        </Tab>
      </Tabs>
    </div>
  );
}
