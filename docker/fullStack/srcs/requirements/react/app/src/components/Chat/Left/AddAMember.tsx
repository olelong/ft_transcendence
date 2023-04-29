import { useState } from "react";

import Spinner from "react-bootstrap/Spinner";

import SearchBar from "../SearchBar";
import CatPongImage from "../../CatPongImage";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/AddAMember.css";

import { serverUrl } from "index";

// Component to add a member in a private channel

function add(channelId: number, userId: number) {
  fetch(serverUrl + "/chat/channels/" + channelId + "/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userId),
  })
    .then((res) => res.json())
    .then((data) => {
      return;
    })
    .catch((err) => console.error(err));
}

export default function AddAMember({ channelId }: { channelId: number }) {
  const [userId, setUserId] = useState<number>(-1);
  const [displaySearchUsers, setDisplaySearchUsers] = useState<any>();
  const [searchUsers, setSearchUsers] = useState<any>();

  return (
    <>
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
                if (res.status >= 200 && res.status < 300) return res.json();
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
              searchUsers.map((user: any) => (
                <div className="member-container" key={user.id}>
                  <CatPongImage user={user} />
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
    </>
  );
}
