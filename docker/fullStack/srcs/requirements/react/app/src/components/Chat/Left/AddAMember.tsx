import { useState } from "react";

import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import SearchBar from "../SearchBar";
import CatPongImage from "../../CatPongImage";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/AddAMember.css";

import { serverUrl } from "index";

// Component to add a member in a private channel

export default function AddAMember({ channelId, showModalMember, setShowModalMember }: { channelId: number; showModalMember: boolean; setShowModalMember: (newValue: boolean) => void; }) {
  const [userId, setUserId] = useState<number>(-1);
  const [displaySearchUsers, setDisplaySearchUsers] = useState<any>();
  const [searchUsers, setSearchUsers] = useState<any>();

  function handleSelectedUser(userId: number) {
    setUserId(userId);
  }

  function add() {
    if (userId !== -1) {
      fetch(serverUrl + "/chat/channels/" + channelId + "/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", "accept": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: userId }),
      })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) => {
          setUserId(-1);
          return;
        })
        .catch((err) => console.error(err));
    }
  }

  return (
    <>
      <Modal show={showModalMember} onHide={() => setShowModalMember(false)}>
        <Modal.Header
          closeButton
          id="btn-close-modal"
          closeVariant="white"
        >
          <Modal.Title>Add a Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
            <div className="search-add-users-results">
              {searchUsers ? (
                searchUsers.length > 0 ? (
                  searchUsers.map((user: any) => (
                    <div className="add-member-container member-container" key={user.id} tabIndex={0} onClick={() => handleSelectedUser(user.id)} >
                      <CatPongImage user={user} style={{ width: "50px", height: "50px" }} />
                      <div className="search-user-name-container">
                        <p className="member-name ">{user.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-users-found-text">No users found</p>
                )
              ) : (
                <Spinner
                  style={{ width: "30px", height: "30px", margin: "20px auto" }}
                />
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="modal-cancel-button"
            onClick={() => {
              setUserId(-1);
              setShowModalMember(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="modal-delete-button"
            onClick={() => {
              add();
              setUserId(-1);
              setShowModalMember(false);
            }}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
