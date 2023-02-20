import { useContext } from "react";
import { SocketContext } from "./Header";

import Button, { ButtonProps } from "react-bootstrap/Button";
import "../styles/InGameCheckButton.css";

export default function InGameCheckButton(props: ButtonProps) {
  const { inGame } = useContext(SocketContext);

  return (
    <div className="ig-check-btn-wrapper">
      <Button {...props} disabled={inGame} />
      <p className="ig-check-btn-tooltip">
        <strong>You're already in a game!</strong>
      </p>
    </div>
  );
}
