import {
    useContext,
    useRef,
    cloneElement,
    Children,
    ReactElement,
  } from "react";
  import { SocketContext } from "./Header";
  
  import "../styles/InGameCheckWrapper.css";
  
  export default function InGameCheckWrapper({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const { inGame } = useContext(SocketContext);
    const tooltip = useRef<HTMLParagraphElement>(null);
  
    const child = cloneElement(
      Children.only(children) as ReactElement,
      inGame
        ? {
            onClick: () => {},
          }
        : undefined
    );
  
    return (
      <div
        className="ig-check-wrapper"
        style={{
          cursor: inGame ? "not-allowed" : "pointer",
        }}
        onMouseEnter={() => {
          if (inGame && tooltip.current)
            tooltip.current.style.visibility = "visible";
        }}
        onMouseLeave={() => {
          if (tooltip.current) tooltip.current.style.visibility = "hidden";
        }}
      >
        <div style={{ cursor: inGame ? "not-allowed" : "pointer" }}>
          {child}
        </div>
        <p className="ig-check-tooltip" ref={tooltip}>
          <strong>You're already in a game!</strong>
        </p>
      </div>
    );
  }
  