import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../../../utils/useWindowSize";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import Messages from "./Messages";
import SearchBar from "../SearchBar";
import CatPongImage from "../../../components/CatPongImage";
import { ConvContext } from "../../../pages/Chat";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/containers.css";
import "../../../styles/Chat/Middle/Middle.css";
import "../../../styles/Chat/Right/MembersCategory.css";

export default function Middle() {
  const { currConv } = useContext(ConvContext);
  const [extras, setExtras] = useState({ text: "", active: false });
  const [displaySearchUsers, setDisplaySearchUsers] = useState(false);
  const [searchUsers, setSearchUsers] = useState<Member[]>();
  const navigate = useNavigate();
  const size = useWindowSize();

  /* Manage right pane responsive */
  useEffect(() => {
    if (!currConv) return;

    let newExtrasText = "";

    if (extras.active) newExtrasText += "Hide ";
    else newExtrasText += "Show ";

    if (currConv.isChan) newExtrasText += "members";
    else newExtrasText += "all channels";

    setExtras((extras) => ({ ...extras, text: newExtrasText }));
  }, [currConv, extras.active]);

  useEffect(() => {
    if (size.width > 991) {
      const [rightPane] = getRightPane();
      rightPane.style.display = "block";
      setExtras((extras) => ({ ...extras, active: true }));
    }
  }, [size]);

  return (
    <div id="chat-middle">
      <div className="middle-header">
        {currConv && (
          <Button
            className="extras-button"
            onClick={() => {
              const [rightPane, style] = getRightPane();
              if (style.display === "none") rightPane.style.display = "block";
              else rightPane.style.display = "none";
              setExtras({ ...extras, active: !extras.active });
            }}
          >
            {extras.text}
          </Button>
        )}
        <div className="search-users-container">
          <SearchBar
            placeholder="User"
            onChange={(e) => {
              setDisplaySearchUsers(e.target.value !== "");
              if (e.target.value !== "") {
                setSearchUsers(undefined);
                fetch(serverUrl + "/user/search", {
                  credentials: "include",
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ filter: e.target.value }),
                })
                  .then((res) => {
                    if (res.status >= 200 && res.status < 300)
                      return res.json();
                    throw new Error(res.status + ": " + res.statusText);
                  })
                  .then((data) => setSearchUsers(data.users))
                  .catch(console.error);
              }
            }}
          />
          {displaySearchUsers && (
            <div className="search-users-results purple-container">
              {searchUsers ? (
                searchUsers.length > 0 ? (
                  searchUsers.map((user) => (
                    <div className="member-container" key={user.id}>
                      <CatPongImage
                        user={user}
                        onClick={() => navigate("/home/profile/" + user.id)}
                      />
                      <div className="search-user-name-container">
                        <p className="member-name">{user.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-users-found-text">No users found</p>
                )
              ) : (
                <Spinner
                  style={{ width: "70px", height: "70px", margin: "20px auto" }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="middle-container purple-container">
        {currConv ? (
          <Messages />
        ) : (
          <div className="spinner-container">
            <Spinner className="spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

function getRightPane(): [HTMLElement, CSSStyleDeclaration] {
  const rightPane = document.getElementById("chat-right");
  if (!rightPane) throw new Error("Right pane not found!");
  const style = window.getComputedStyle(rightPane);
  return [rightPane, style];
}
