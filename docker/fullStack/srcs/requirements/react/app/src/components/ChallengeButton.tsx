import { useContext, useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import { BsFillExclamationTriangleFill } from "react-icons/bs";

import InGameCheckWrapper from "./InGameCheckWrapper";
import { SocketContext } from "./Header";

import { GiCrossedSwords } from "react-icons/gi";

export default function ChallengeButton({
  challengedUser,
}: {
  challengedUser: { id: string; name: string };
}) {
  const { chatSocket } = useContext(SocketContext);
  const [challengeStatus, setChallengeStatus] = useState<
    "none" | "sending" | "sent" | "not sent"
  >("none");
  const [onError, setOnError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!onError && chatSocket) {
      chatSocket.on("error", (data) => {
        if (
          data.origin.event === "challenge" &&
          data.origin.data.action === "send"
        ) {
          let errorMessage: string;
          if (Array.isArray(data.errorMsg)) errorMessage = data.errorMsg[0];
          else errorMessage = data.errorMsg;
          setErrorMsg(
            errorMessage.replaceAll(challengedUser.id, challengedUser.name)
          );
          setChallengeStatus("not sent");
          const timeout = setTimeout(() => {
            setErrorMsg("");
            clearTimeout(timeout);
          }, 3000);
        }
      });
      setOnError(true);
    }
  }, [chatSocket, onError, challengedUser]);

  useEffect(() => {
    return () => {
      chatSocket?.off("error");
    };
  }, [chatSocket]);

  return chatSocket ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <InGameCheckWrapper
        cursor={challengeStatus === "none" ? "pointer" : "default"}
      >
        <Button
          style={{
            cursor: "inherit",
            whiteSpace: "nowrap",
          }}
          className="purple-button"
          disabled={challengeStatus !== "none"}
          onClick={() => {
            setChallengeStatus("sending");
            chatSocket.emit(
              "challenge",
              {
                action: "send",
                opponentName: challengedUser.id,
              },
              (success: boolean) => {
                if (success) setChallengeStatus("sent");
              }
            );
          }}
        >
          {challengeStatus === "none"
            ? "Challenge"
            : firstCap(challengeStatus) +
              (challengeStatus === "sending" ? "..." : "")}
          <GiCrossedSwords size={22} style={{ marginLeft: 8 }} />
        </Button>
      </InGameCheckWrapper>
      {errorMsg !== "" && (
        <div
          style={{
            backgroundColor: "var(--rose)",
            padding: 2,
            borderRadius: 5,
          }}
        >
          <BsFillExclamationTriangleFill
            size={25}
            style={{ paddingRight: 7 }}
          />
          {errorMsg}
        </div>
      )}
    </div>
  ) : null;
}

function firstCap(str: string): string {
  str = str[0].toUpperCase() + str.substring(1);
  return str;
}
