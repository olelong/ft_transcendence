import { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { BiSearchAlt } from "react-icons/bi";

import { ConvContext } from "../../pages/Chat";
import { serverUrl } from "index";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Right.css";

export default function Right() {
  const { currConv } = useContext(ConvContext);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);

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

  return (
    <div id="chat-right" className="purple-container">
      {!currConv.isChan ? (
        <div className="display-all-channels-container">
          <div className="search-container">
            <p className="search-text">Search</p>
            <Form.Control type="search" className="search-bar" />
            <BiSearchAlt color="var(--violet)" size={30} />
          </div>
          <div className="all-channels-container">
            {allChannels.map((chan) => (
              <div className="channel-container">
                <div className="channel-avatar-container">
                  <img
                    src={serverUrl + chan.avatar}
                    alt={chan.name + "'s avatar"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>salut</p>
      )}
    </div>
  );
}
