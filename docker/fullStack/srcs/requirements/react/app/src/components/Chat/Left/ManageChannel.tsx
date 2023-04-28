import { useEffect, useState, useRef } from "react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/ManageChannel.css";

import CatPongImage from "../../CatPongImage";
import EditNameChannel from "./EditNameChannel";
import EditPasswordChannel from "./EditPasswordChannel";

import brush from "../../../assets/icons/brush.png";

import { serverUrl } from "index";

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
  const [channelName, setChannelName] = useState<string>();
  const [channelAvatar, setChannelAvatar] =
    useState<string>("/image/default.jpg");
  const [channelAvatarFile, setChannelAvatarFile] = useState<File | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [channelType, setChannelType] = useState<string>();
  const [channelPassword, setChannelPassword] = useState<string | undefined>(
    ""
  );
  const [channelId, setChannelId] = useState<number | null>(null);

  const modalTitle = isExisted === true ? "Edit a channel" : "Create a channel";
  const modalExit = isExisted === true ? "Edit" : "Create";

  const [typeValue, setTypeValue] = useState("1");
  const chanTypes = [
    { name: "public", value: "1" },
    { name: "protected", value: "2" },
    { name: "private", value: "3" },
  ];

  // Request Post to upload an image:
  /*useEffect(() => {
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
        console.log(channelAvatar);
      })
      .catch((err) => console.error(err));
  }, [channelAvatarFile]);*/

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
        <Modal.Header
          closeButton
          id="btn-close-modal"
          closeVariant="white"
          onClick={() => {
            setChannelName(undefined);
            setChannelAvatar("/image/default.jpg");
            setChannelId(null);
            setChannelType(undefined);
            setChannelPassword("");
          }}
        >
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Avatar of the channel */}
          <CatPongImage
            user={
              channelId !== null
                ? { id: channelId, name: channelName, avatar: channelAvatar }
                : { id: -1, name: "", avatar: channelAvatar }
            }
            className="channel-avatar"
          />

          {/* Edit the avatar of the channel */}
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

          {/* Edit the name of the channel */}
          <EditNameChannel
            channelName={channelName}
            setChannelName={setChannelName}
          />

          {/* Edit the type of the channel: private, protected, public */}
          <ButtonGroup>
            {chanTypes.map((type, index) => (
              <ToggleButton
                key={index}
                id={`type-${index}`}
                type="radio"
                className={
                  type.value !== typeValue
                    ? "type-button-unchecked"
                    : "type-button-checked"
                }
                name="chan-type"
                value={type.value}
                checked={typeValue === type.value}
                onChange={(e) => {
                  setChannelType(type.name);
                  setTypeValue(e.currentTarget.value);
                }}
              >
                {type.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
          {/* Edit a password for a protected channel */}
          {channelType && (
            <EditPasswordChannel
              channelType={channelType}
              channelPassword={channelPassword}
              setChannelPassword={setChannelPassword}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="modal-cancel-button"
            onClick={() => {
              setChannelName(undefined);
              setChannelAvatar("/image/default.jpg");
              setChannelId(null);
              setChannelType(undefined);
              setChannelPassword("");
              setShowModalManage(false);
            }}
          >
            Cancel
          </Button>
          {((channelName === undefined || (
            channelType === "protected" &&
            channelPassword === "")) ||
            (channelName === undefined && channelType !== "protected")) && (
            <Button variant="var(--light)" disabled>
              {modalExit}
            </Button>
          )}
          {/*channelName !== undefined && (
            <Button
              className="modal-delete-button"
              onClick={() => {
                !isExisted ? createChannel() : editChannel();
                setChannelName(undefined);
                setChannelAvatar("/image/default.jpg");
                setChannelId(null);
                setChannelType(undefined);
                setChannelPassword("");
                setShowModalManage(false);
              }}
            >
              {modalExit}
            </Button>
            )*/}
        </Modal.Footer>
      </Modal>{" "}
    </>
  );
}
