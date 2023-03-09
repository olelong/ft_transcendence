import { useContext, useEffect, useState } from "react";
import useWindowSize from "../../utils/useWindowSize";
import Button from "react-bootstrap/Button";

import { ConvContext } from "../../pages/Chat";

import "../../styles/Chat/containers.css";
import "../../styles/Chat/Middle.css";

export default function Middle() {
  const { currConv, setCurrConv } = useContext(ConvContext);
  const [extras, setExtras] = useState({ text: "", active: false });
  const size = useWindowSize();

  /* Manage right pane responsive */
  useEffect(() => {
    let newExtrasText = "";

    if (extras.active) newExtrasText += "Hide ";
    else newExtrasText += "Show ";

    if (currConv.isChan) newExtrasText += "members";
    else newExtrasText += "all channels";

    setExtras((extras) => ({ ...extras, text: newExtrasText }));
  }, [currConv, extras.active]);

  useEffect(() => {
    if (size.width > 991) {
      const [rightPane] = getRightPane();
      rightPane.style.display = "block";
      setExtras((extras) => ({ ...extras, active: true }));
    }
  }, [size]);

  return (
    <div id="chat-middle">
      <div className="middle-header">
        <Button
          className="extras-button"
          onClick={() => {
            const [rightPane, style] = getRightPane();
            if (style.display === "none") rightPane.style.display = "block";
            else rightPane.style.display = "none";
            setExtras({ ...extras, active: !extras.active });
          }}
        >
          {extras.text}
        </Button>
      </div>
      <div className="messages-container purple-container"></div>
    </div>
  );
}

function getRightPane(): [HTMLElement, CSSStyleDeclaration] {
  const rightPane = document.getElementById("chat-right");
  if (!rightPane) throw new Error("Right pane not found!");
  const style = window.getComputedStyle(rightPane);
  return [rightPane, style];
}
