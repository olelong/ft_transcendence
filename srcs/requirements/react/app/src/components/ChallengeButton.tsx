import { useContext, useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import { BsFillExclamationTriangleFill } from "react-icons/bs";

import InGameCheckWrapper from "./InGameCheckWrapper";
import { SocketContext } from "./Header";

import { GiCrossedSwords } from "react-icons/gi";

import "../styles/index.css";

import { serverUrl } from "../index";

export default function ChallengeButton({
  challengedUser,
}: {
  challengedUser: { id: string; name: string };
}) {
  const { chatSocket } = useContext(SocketContext);
  const [challengeStatus, setChallengeStatus] = useState<
    "none" | "sending" | "sent" | "not sent"
  >("none");
  const [errorMsg, setErrorMsg] = useState("");
  const [isBlocked, setIsBlocked] = useState<boolean>();

  useEffect(() => {
    setChallengeStatus("none");
    setErrorMsg("");
    setIsBlocked(undefined);
    fetch(serverUrl + "/user/blocks/" + challengedUser.id, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data) => setIsBlocked(data.ok))
      .catch(console.error);
  }, [challengedUser.id]);

  useEffect(() => {
    function onError(data: NetError) {
      if (
        data.origin.event === "challenge" &&
        (data.origin.data as { action: string }).action === "send"
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
    }

    chatSocket?.on("error", onError);

    return () => {
      chatSocket?.off("error", onError);
    };
  }, [chatSocket, challengedUser]);

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
          className="purple-button challenge-button-mobile"
          disabled={challengeStatus !== "none"}
          onClick={() => {
            if (isBlocked) {
              setErrorMsg("You cannot challenge " + challengedUser.name);
              setChallengeStatus("not sent");
              const timeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(timeout);
              }, 3000);
              return;
            }
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
