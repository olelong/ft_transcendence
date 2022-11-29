import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [msg, updateMsg] = useState(null);

  fetch("http://127.0.0.1:3001")
    .then(response => response.json())
    .then(data => updateMsg(data.msg))
    .catch(err => console.error(err));

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
          Tabby's pingpong, msg: {msg}
        </a>
      </header>
    </div>
  );
}

export default App;
