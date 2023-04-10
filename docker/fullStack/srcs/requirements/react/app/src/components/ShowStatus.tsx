import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GoEye } from "react-icons/go";

import InGameCheckWrapper from "../components/InGameCheckWrapper";
import { SocketContext } from "../components/Header";

export default function ShowStatus({
    user,
    dontShow,
    classNameOnOffline,
    classNameInGame,
    styleOnOffline,
    styleInGame,
  }: ShowStatusProps) {
    const { chatSocket, setInGame } = useContext(SocketContext);
    const navigate = useNavigate();
  
    return user.status ? (
      user.status !== "ingame" ? (
        <div
          className={"member-status " + classNameOnOffline}
          style={{
            backgroundColor:
              user.status === "online" ? "var(--online)" : "var(--offline)",
            ...styleOnOffline,
          }}
        />
      ) : (
        <InGameCheckWrapper>
          <GoEye
            className={"member-status-ingame " + classNameInGame}
            style={styleInGame}
            onClick={() => {
              chatSocket?.emit(
                "game-room",
                {
                  join: true,
                  roomId: user.gameid,
                },
                (success: boolean) => {
                  if (success) {
                    setInGame(true);
                    navigate("/home/game");
                  }
                }
              );
            }}
          />
        </InGameCheckWrapper>
      )
    ) : !dontShow ? (
      <div
        className={"member-status " + classNameOnOffline}
        style={styleOnOffline}
      />
    ) : null;
  }
  