import { useContext } from "react";

import Button from "react-bootstrap/Button";

import { ConvContext } from "../../pages/Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Left.css";

export default function Left() {
  const { setCurrConv } = useContext(ConvContext);

  return (
    <div id="chat-left" className="purple-container">
      <Button
        onClick={() =>
          setCurrConv({
            isChan: false,
            id: "$test",
            name: "test",
            avatar: "/image/default.jpg",
          })
        }
      >
        test
      </Button>
      <Button
        onClick={() =>
          setCurrConv({
            isChan: false,
            id: "$test2",
            name: "test2",
            avatar: "/image/default.jpg",
          })
        }
      >
        test2
      </Button>
      <Button
        onClick={() =>
          setCurrConv({
            isChan: true,
            id: 1,
            name: "wael channel -----------------",
            avatar: "/image/default.jpg",
          })
        }
      >
        wael channel
      </Button>
    </div>
  );
}