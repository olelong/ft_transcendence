import { CSSProperties } from "react";

import { serverUrl } from "../index";

import "../styles/CatPongImage.css";

export default function CatPongImage({
  user,
  onClick,
  className,
  style,
}: {
  user: { id?: string | number; name?: string; avatar: string };
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={"image-container " + className}
      style={{ ...style, cursor: onClick ? "pointer" : "auto" }}
      onClick={onClick || undefined}
    >
      <img src={serverUrl + user.avatar} alt={user.name + "'s avatar"} />
    </div>
  );
}
