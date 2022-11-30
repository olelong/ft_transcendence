import React from 'react';
import logo from './logo.svg';
import './App.css';

// function fct(response: any) {
//   return response.json();
// }

function App() {
  fetch("http://127.0.0.1:3001/user/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({id: "1"})
  })
    .then(response => response.json())
    .then(data => console.log("id: ===> ", data.id, "name ===>", data.name, "avatar ==>", data.avatar))
    .catch(error => console.error("error ==> ", error));

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
