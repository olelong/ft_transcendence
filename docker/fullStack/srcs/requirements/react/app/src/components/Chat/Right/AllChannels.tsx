import { SyntheticEvent, useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { BsFillExclamationTriangleFill } from "react-icons/bs";

import SearchBar from "../SearchBar";
import { serverUrl } from "../../../index";
import useWindowSize from "../../../utils/useWindowSize";
import { formatDiffTime } from "./SanctionTime";

import "../../../styles/Chat/containers.css";
import "../../../styles/Chat/Right/AllChannels.css";

export default function AllChannels() {
  const [myChannels, setMyChannels] = useState<Omit<Channel, "protected">[]>();
  const [allChannels, setAllChannels] = useState<Channel[]>();
  const [filterChannels, setFilterChannels] = useState("");
  const [password, setPassword] = useState({ chanid: 0, password: "" });
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState<number>(0);
  const textBox = useRef(null);
  const size = useWindowSize();

  useEffect(() => {
    fetch(serverUrl + "/chat/channels/all")
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error(res.statusText);
      })
      .then((data) => setAllChannels(data.channels))
      .catch(console.error);

    fetch(serverUrl + "/chat/channels", { credentials: "include" })
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error(res.statusText);
      })
      .then((data) => setMyChannels(data.channels))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (textBox.current) {
      const box = textBox.current as HTMLDivElement;
      box.style.display = "none";
    }
  }, [size]);

  const joinChannel = (id: number, event: SyntheticEvent<HTMLFormElement>) => {
    setJoining(id);
    event.preventDefault();
    const error = (msg: string) => {
      const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;
      const dateIndex = msg.search(isoDateRegex);
      if (dateIndex !== -1)
        msg =
          "You are banned from this channel for " +
          formatDiffTime(
            new Date(msg.substring(dateIndex)).getTime() - Date.now()
          );
      setJoinError(msg);
      placeJoinTextBox(textBox.current, event.target as HTMLFormElement);
    };
    fetch(serverUrl + "/chat/channels/" + id + "/join", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password:
          password.chanid === id && password.password
            ? password.password
            : undefined,
      }),
    })
      .then((res) => {
        if (res.status === 400 || res.status >= 500)
          throw new Error(res.status + ": " + res.statusText);
        return res.json();
      })
      .then((data: ErrorRes | { ok: boolean }) => {
        setJoining(0);
        if ("ok" in data && data.ok) window.location.reload();
        else if ("message" in data && data.message) error(data.message);
        else throw data;
      })
      .catch((err) => {
        setJoining(0);
        error("An error has occurred, please try again later.");
        console.error(err);
      });
  };

  return (
    <div className="display-all-channels-container">
      <SearchBar
        onChange={(e) => {
          setFilterChannels(e.target.value);
          if (textBox.current) {
            const box = textBox.current as HTMLDivElement;
            box.style.display = "none";
          }
        }}
        className="search-channels"
        placeholder="Channel"
      />
      {allChannels && myChannels ? (
        <div className="all-channels-container">
          {allChannels.length === 0 ? (
            <p>No public channels but you can create one!</p>
          ) : (
            allChannels
              .filter((chan) => {
                if (filterChannels === "") return true;
                else if (
                  chan.name.toLowerCase().includes(filterChannels.toLowerCase())
                )
                  return true;
                return false;
              })
              .map((chan) => (
                <div className="channel-container" key={chan.id}>
                  <div className="channel-avatar-container">
                    <img
                      src={serverUrl + chan.avatar}
                      alt={chan.name + "'s avatar"}
                    />
                  </div>
                  <Form
                    onSubmit={(e) => joinChannel(chan.id, e)}
                    className="channel-form"
                  >
                    <div className="channel-name-container">
                      <p className="channel-name">{chan.name}</p>
                    </div>
                    {chan.protected && (
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        className="channel-password"
                        value={
                          chan.id === password.chanid ? password.password : ""
                        }
                        onChange={(e) => {
                          setPassword({
                            chanid: chan.id,
                            password: e.target.value,
                          });
                        }}
                      />
                    )}
                    {!myChannels.find((c) => c.id === chan.id) ? (
                      <Button type="submit" className="join-button">
                        {joining === chan.id ? (
                          <Spinner variant="light" size="sm" />
                        ) : (
                          "Join"
                        )}
                      </Button>
                    ) : (
                      <div className="joined-text-container">
                        <p
                          style={{
                            marginBottom: "auto",
                            fontStyle: "italic",
                          }}
                        >
                          Joined
                        </p>
                      </div>
                    )}
                  </Form>
                </div>
              ))
          )}
          <div className="text-box-container" ref={textBox}>
            <div className="text-box-triangle" />
            <div className="text-box-text">
              <div className="text-box-icon-container">
                <BsFillExclamationTriangleFill size={20} />
              </div>
              <p>{joinError}</p>
            </div>
          </div>
        </div>
      ) : (
        <Spinner style={{ width: "100px", height: "100px", margin: "auto" }} />
      )}
    </div>
  );
}

function placeJoinTextBox(
  textBox: HTMLDivElement | null,
  target: HTMLFormElement
) {
  const button = target.children[target.children.length - 1];
  const buttonRect = button.getBoundingClientRect();
  if (textBox) {
    const box = textBox;
    box.style.display = "flex";
    // Top
    box.style.top = buttonRect.top + "px";
    let boxRect = box.getBoundingClientRect();
    const offsetY = boxRect.top - buttonRect.top;
    box.style.top = buttonRect.top - offsetY + buttonRect.height + "px";
    // Left
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    box.style.left = buttonRect.left + "px";
    boxRect = box.getBoundingClientRect();
    const offsetX = boxRect.left - buttonRect.left;
    box.style.left =
      buttonRect.left - offsetX - (boxRect.width - buttonRect.width) / 2 + "px";
    document.body.style.overflow = oldOverflow;

    // Clear all timeouts so the next one is the only
    // that can hide the text box
    let id = window.setTimeout(function () {}, 0);
    while (id--) window.clearTimeout(id);
    // Hide the text box in 2 minutes
    const timeout = setTimeout(() => {
      box.style.display = "none";
      clearTimeout(timeout);
    }, 2000);
  }
}
