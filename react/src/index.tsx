import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Play from "./pages/Play";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Header from "./components/Header";
import Game from "./pages/Game";

import "./styles/index.css";

export const serverUrl = "https://catpong.vercel.app";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/home/play" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Header />}>
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route index path="play" element={<Play />} />
        <Route path="game" element={<Game />} />
        <Route path="chat" element={<Chat />} />
      </Route>
    </Routes>
  </Router>
);

// Deactivate errors in console
console.error = () => {};
