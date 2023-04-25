import { useEffect, useState, useRef } from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/ManageChannel.css";

import CatPongImage from "../../CatPongImage";

import brush from "../../../assets/icons/brush.png";

import { serverUrl } from "index";

function EditNameChannel({
  channelName,
  setChannelName,
}: {
  channelName: string;
  setChannelName: (newValue: string) => void;
}) {
  const [userInput, setUserInput] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string | "">("");
  const [channelNameMsgErr, setChannelNameMsgErr] = useState<string | "">("");

  return (
    <Form
      className="displayname-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (userInput.length === 0) setInputMessage("");
        else setChannelName(userInput);
      }}
    >
      <label className="displayname-label">
        Channel s name:
        <input
          type="text"
          id="displayName"
          name="profile-input"
          value={userInput}
          autoComplete="off"
          pattern="^[\w-]{2,30}$" // Use of regex (regular expression)
          placeholder={channelName ? channelName : "Enter name"}
          onChange={(e) => {
            setUserInput(e.target.value);
            setChannelNameMsgErr("");
          }}
        />
        {channelNameMsgErr && (
          <div className="display-name-error-message">{channelNameMsgErr}</div>
        )}
      </label>

      <button
        type="submit"
        className="displayname-button"
        onClick={() => {
          if (!/^[\w-]{2,30}$/.test(userInput)) {
            setChannelNameMsgErr(
              "Invalid display name. Use letters, numbers, _, and -. Min 2, max 30 chars."
            );
            setInputMessage("");
          }
        }}
      >
        Save Changes
      </button>
      <p className="input-message-displayname">{inputMessage}</p>
    </Form>
  );
}

// Composant pour créer ou édit un channel
export default function ManageChannel({
  showModalManage,
  setShowModalManage,
  isExisted,
}: {
  showModalManage: boolean;
  setShowModalManage: (newValue: boolean) => void;
  isExisted: boolean;
}) {
  const [channelName, setchannelName] = useState<string>();
  const [channelAvatar, setChannelAvatar] =
    useState<string>("/image/default.jpg");
  const [channelAvatarFile, setChannelAvatarFile] = useState<File | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [channelType, setChannelType] = useState<
    "public" | "protected" | "private"
  >();
  const [channelPassword, setChannelPassword] = useState<string | null>("");
  const [channelId, setChannelId] = useState<number | null>(null);

  const modalTitle = isExisted === true ? "Edit a channel" : "Create a channel";
  const modalExit = isExisted === true ? "Edit" : "Create";

  // Request Post to upload an image:
  useEffect(() => {
    const formData = new FormData();
    if (channelAvatarFile) formData.append("image", channelAvatarFile);
    fetch(serverUrl + "/image", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) setChannelAvatar(data.url);
      })
      .catch((err) => console.error(err));
  }, [channelAvatarFile]);

  function createChannel() {
    fetch(serverUrl + "/chat/channels", {
      method: "POST",
      body: JSON.stringify({
        name: channelName,
        avatar: channelAvatar,
        type: channelType,
        password: channelPassword,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) setChannelId(data.id);
      })
      .catch((err) => console.error(err));
  }

  function editChannel() {
    fetch(serverUrl + "/chat/channels/" + channelId, {
      method: "PUT",
      body: JSON.stringify({
        name: channelName,
        avatar: channelAvatar,
        type: channelType,
        password: channelPassword,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {})
      .catch((err) => console.error(err));
  }

  return (
    <>
      <Modal show={showModalManage} onHide={() => setShowModalManage(false)}>
        <Modal.Header closeButton id="btn-close-modal" closeVariant="white">
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CatPongImage
            user={
              channelId !== null
                ? { id: channelId, name: channelName, avatar: channelAvatar }
                : { id: -1, name: "", avatar: channelAvatar }
            }
            className="channel-avatar"
          />
          <form>
            <div
              className="change-channel-avatar-button"
              // On créer un event click et on le renvoie à l'input
              onClick={() => {
                if (avatarInput && avatarInput.current)
                  avatarInput.current.dispatchEvent(new MouseEvent("click"));
              }}
            >
              <img
                src={brush}
                alt="Icon to change avatar"
                className="brush-icon"
              />
              <input
                type="file"
                id="search-channel-avatar-file"
                accept="image/png, image/jpeg"
                ref={avatarInput} // On dit a quel useRef faire référence
                onChange={(e) =>
                  setChannelAvatarFile(e.target.files && e.target.files[0])
                }
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="modal-cancel-button"
            onClick={() => {
              setShowModalManage(false);
            }}
          >
            Cancel
          </Button>
          {channelId === null && (
            <Button variant="var(--light)" disabled>
              {modalExit}
            </Button>
          )}
          {channelId !== null && (
            <Button
              className="modal-delete-button"
              onClick={() => {
                !isExisted ? createChannel() : editChannel();
                setShowModalManage(false);
              }}
            >
              {modalExit}
            </Button>
          )}
        </Modal.Footer>
      </Modal>{" "}
    </>
  );
}
