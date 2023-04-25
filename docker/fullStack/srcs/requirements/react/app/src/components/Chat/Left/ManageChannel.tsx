import { useEffect, useState, useRef } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/ManageChannel.css";

import CatPongImage from "../../CatPongImage";

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
