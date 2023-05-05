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
  channelToEdit,
  showModalManage,
  setShowModalManage,
  channels,
  setChannels,
  isExisted,
}: {
  channelToEdit: ChannelLeft | undefined;
  showModalManage: boolean;
  setShowModalManage: (newValue: boolean) => void;
  channels: ChannelLeft[] | undefined;
  setChannels: (newValue: ChannelLeft[] | undefined) => void;
  isExisted: boolean;
}) {
  const [channelName, setChannelName] = useState(
    isExisted && channelToEdit !== undefined ? channelToEdit.name : undefined
  );
  const [channelAvatar, setChannelAvatar] = useState<string>(
    isExisted && channelToEdit !== undefined
      ? channelToEdit.avatar
      : "/image/default.jpg"
  );
  const [channelAvatarFile, setChannelAvatarFile] = useState<File | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [channelType, setChannelType] = useState<string>();
  const [channelPassword, setChannelPassword] = useState<string | undefined>();
  //const [createchannelId, setCreateChannelId] = useState<number | undefined>();

  //console.log("chan", channelToEdit);

  const modalTitle = isExisted === true ? "Edit a channel" : "Create a channel";
  const modalExit = isExisted === true ? "Edit" : "Create";

  const [typeValue, setTypeValue] = useState<string>();

  const chanTypes = [
    { name: "public", value: "1" },
    { name: "protected", value: "2" },
    { name: "private", value: "3" },
  ];

  useEffect(() => {
    setTypeValue(
      channelType === "public" ? "1" : channelType === "protected" ? "2" : "3"
    );
  }, [channelType]);

  // Request Post to upload an image:
  const uploadImage = () => {
    if (channelAvatarFile) {
      const formData = new FormData();
      formData.append("image", channelAvatarFile);

      return fetch(serverUrl + "/image", {
        method: "POST",
        headers: { accept: "*/*" },
        body: formData,
        credentials: "include",
      })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) => {
          if (data) {
            setChannelAvatar(data.url);
            //console.log("image uploaded successfully", data.url, channelAvatar);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  // Create a new channel
  function createChannel() {
    console.log(channelPassword);
    fetch(serverUrl + "/chat/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: channelName,
        avatar: channelAvatar,
        type: channelType,
        password: channelPassword,
      }),
      credentials: "include",
    })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => {
        const chanName = channelName as string;
        if (channels) {
          setChannels([
            ...channels,
            {
              id: data.id,
              name: chanName,
              avatar: channelAvatar,
              private: channelType === "private" ? true : false,
              role: "owner",
              dropdownOpen: false,
            },
          ]);
        }
      })
      .catch((err) => console.error(err));
  }

  // Edit the channel
  function editChannel() {
    if (channelToEdit !== undefined) {
      console.log("edit channel: ", channelToEdit);
      console.log(
        "ok: ",
        channelName,
        channelType,
        channelAvatar,
        channelPassword
      );
      fetch(serverUrl + "/chat/channels/" + channelToEdit.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: channelName, //!== undefined && channelName !== channelToEdit.name ? channelName : channelToEdit.name,
          avatar: channelAvatar,
          type: channelType,
          password: channelType === "protected" ? channelPassword : undefined,
        }),
        credentials: "include",
      })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) return [true, res.json()];
          if (res.status === 400) return [false, res.json()];
          throw new Error(res.status + ": " + res.statusText);
        })
        .then(([success, data]) => {
          console.log("data: ", success, data);
        })
        .catch((err) => console.error(err));
    }
  }

  // Get the type of the channel
  useEffect(() => {
    if (isExisted) {
      if (channelToEdit && channelToEdit.private === true)
        setChannelType("private");
      else if (channelToEdit && channelToEdit.private === false) {
        fetch(serverUrl + "/chat/channels/all", {
          credentials: "include",
        })
          .then((res) => {
            if (res.status >= 200 && res.status < 300) return res.json();
            throw new Error(res.status + ": " + res.statusText);
          })
          .then((data) => {
            const chan = data.channels.find(
              (c: Channel) => c.id === channelToEdit.id
            );
            if (chan)
              setChannelType(chan.protected === true ? "protected" : "public");
            else return;
          })
          .catch((err) => console.error(err));
      }
    } else {
      setChannelType("public");
    }
  }, [isExisted, channelToEdit]);

  useEffect(() => {
    console.log("type: ", channelType);
    if (channelType !== "protected") setChannelPassword(undefined);
  }, [channelType, channelToEdit]);

  function closeModal() {
    setChannelName(undefined);
    setChannelAvatar("/image/default.jpg");
    setChannelType("public");
    setTypeValue("1");
    setChannelPassword("");
    setShowModalManage(false);
    console.log("modal closed");
  }

  return (
    <>
      <Modal show={showModalManage} onHide={closeModal}>
        <Modal.Header closeButton id="btn-close-modal" closeVariant="white">
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Avatar of the channel */}
          <CatPongImage
            user={
              channelToEdit !== undefined
                ? {
                    id: channelToEdit.id,
                    name: channelName,
                    avatar: channelAvatar,
                  }
                : { id: -1, name: "", avatar: channelAvatar }
            }
            className="channel-avatar"
          />

          {/* Edit the avatar of the channel */}
          <form>
            <div
              className="change-channel-avatar-button"
              onClick={() => avatarInput.current?.click()}
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
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setChannelAvatarFile(e.target.files[0]);
                    uploadImage();
                  }
                }}
              />
            </div>
          </form>

          {/* Edit the name of the channel */}
          <EditNameChannel
            channelName={
              channelToEdit !== undefined ? channelToEdit.name : undefined
            }
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
                  console.log("typeName: ", type.name, " value: ", type.value);
                  setChannelType(type.name);
                  setTypeValue(e.currentTarget.value);
                }}
              >
                {type.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
          {/* Edit a password for a protected channel */}
          {channelType === "protected" ? (
            <EditPasswordChannel
              channelPassword={channelPassword}
              setChannelPassword={setChannelPassword}
            />
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button className="modal-cancel-button" onClick={closeModal}>
            Cancel
          </Button>
          {/*Create channel buttons*/}
          {!isExisted &&
            (channelName === undefined ||
              (channelType === "protected" && channelPassword === undefined) ||
              (channelName === undefined && channelType !== "protected")) && (
              <Button variant="var(--light)" disabled>
                {modalExit}
              </Button>
            )}
          {!isExisted &&
            ((channelName !== undefined &&
              channelType === "protected" &&
              channelPassword !== undefined) ||
              (channelName !== undefined && channelType !== "protected")) && (
              <Button
                className="modal-delete-button"
                onClick={() => {
                  createChannel();
                  closeModal();
                }}
              >
                {modalExit}
              </Button>
            )}

          {/*Edit channel button*/}
          {isExisted && (
            <Button
              className="modal-delete-button"
              onClick={() => {
                editChannel();
                closeModal();
              }}
              disabled={channelName === undefined}
            >
              {modalExit}
            </Button>
          )}
        </Modal.Footer>
      </Modal>{" "}
    </>
  );
}
