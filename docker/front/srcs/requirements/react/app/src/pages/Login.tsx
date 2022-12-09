import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import axios from "axios";

import HttpRequestMock from "http-request-mock";
const mocker = HttpRequestMock.setup();

const client_id =
  "u-s4t2ud-4239d0af06b4d6e21f59c42d8a81b4e63ab86b7844da95d23ab477fc499a1c75";
const client_secret =
  "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";
const tokenHost =
  "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-4239d0af06b4d6e21f59c42d8a81b4e63ab86b7844da95d23ab477fc499a1c75&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fhome%2Fplay&response_type=code";

export default function Login() {
  const [msg, updateMsg] = useState();

  fetch("http://127.0.0.1:3001")
    .then((response) => response.json())
    .then((data) => updateMsg(data.msg))
    .catch((err) => console.error(err));

  // 42 API get token
  /*fetch(
    tokenHost +
      "?grant_type=client_credentials&client_id=" +
      client_id +
      "&client_secret=" +
      client_secret,
    {
      method: "POST",
    }
  )
    .then((response) => console.log(response))
    .catch((err) => console.error("catch:", err));*/
  /*axios
    .post(
      tokenHost +
        "?grant_type=client_credentials&client_id=" +
        client_id +
        "&client_secret=" +
        client_secret,
      {
        proxy: {
          protocol: "https",
          host: "api.intra.42.fr",
        },
        maxRedirects: 0,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
    .then((response) => console.log(response))
    .catch((err) => console.error(err));*/

  console.log(
    mocker.post(
      tokenHost +
        "?grant_type=client_credentials&client_id=" +
        client_id +
        "&client_secret=" +
        client_secret,
      null
    )
  );
  axios
    .post(
      tokenHost +
        "?grant_type=client_credentials&client_id=" +
        client_id +
        "&client_secret=" +
        client_secret,
      null,
      { responseType: "json" }
    )
    .then((json) => console.log(json))
    .catch((err) => console.error(err));

  return (
    <div>
      <h2>Login</h2>
      <p>msg from server: {msg}</p>
      <Button>
        <Link to="/home/play">Login</Link>
      </Button>
    </div>
  );
}
