import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Play from "./pages/Play";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat/Chat";
import Header from "./components/Header";

import "./styles/index.css";

export const serverUrl = "http://localhost:3001";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode> --> removed, it was causing issues with login
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home/play" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Header />}>
          <Route path="profile" element={<Profile />} />
          <Route index path="play" element={<Play />} />
          <Route path="game" element={<Game />} />
          <Route path="chat" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  // </React.StrictMode>
);
