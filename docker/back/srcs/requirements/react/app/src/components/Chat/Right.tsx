import { useContext, useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { ConvContext } from "../../pages/Chat";
import SearchBar from "./SearchBar";
import { serverUrl } from "index";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Right.css";

export default function Right() {
  const { currConv } = useContext(ConvContext);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [filterChannels, setFilterChannels] = useState("");
  const [password, setPassword] = useState({ chanid: 0, password: "" });
  const textBox = useRef(null);

  useEffect(() => {
    if (!currConv.isChan) {
      fetch(serverUrl + "/chat/channels/all")
        .then((res) => {
          if (res.status === 200) return res.json();
          throw new Error(res.statusText);
        })
        .then((data) => setAllChannels(data.channels))
        .catch(console.error);
    }
  }, [currConv.isChan]);

  const joinChannel = (id: number) => {};

  return (
    <div id="chat-right" className="purple-container">
      {!currConv.isChan ? (
        <>
          <div className="display-all-channels-container">
            <SearchBar onChange={(e) => setFilterChannels(e.target.value)} />
            <div className="all-channels-container">
              {allChannels
                .filter((chan) => {
                  if (filterChannels === "") return true;
                  else if (
                    chan.name
                      .toLowerCase()
                      .includes(filterChannels.toLowerCase())
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
                      onSubmit={(e) => {
                        const formRect = (
                          e.target as HTMLFormElement
                        ).getBoundingClientRect();
                        if (textBox.current) {
                          const box = textBox.current as HTMLDivElement;
                          console.log(formRect);
                          box.style.top = formRect.top - formRect.height + "px";
                        }
                        e.preventDefault();
                        console.log(password);
                      }}
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
                      <Button type="submit" className="join-button">
                        Join
                      </Button>
                    </Form>
                  </div>
                ))}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "red",
              position: "absolute",
              width: "400px",
              height: "200px",
            }}
            ref={textBox}
          ></div>
        </>
      ) : (
        <p>salut</p>
      )}
    </div>
  );
}
