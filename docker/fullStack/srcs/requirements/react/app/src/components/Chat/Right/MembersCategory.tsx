import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GoEye } from "react-icons/go";

import InGameCheckWrapper from "../../../components/InGameCheckWrapper";
import CatPongImage from "../../../components/CatPongImage";
import { SocketContext } from "../../../components/Header";

import "../../../styles/Chat/Right/MembersCategory.css";
import { MembersContext } from "./Members";

export default function MembersCategory({
  category,
  children,
}: MembersCategoryProps) {
  const { members } = useContext(MembersContext);
  const navigate = useNavigate();

  const membersToMyMembers = (
    members: Members
  ): Members & { owner: SMember[] } => {
    const myMembers = structuredClone(members);
    myMembers.owner = [members.owner];
    return myMembers;
  };
  const categoryMembers = membersToMyMembers(members)[category];

  return categoryMembers && categoryMembers.length !== 0 ? (
    <>
      <p className="title">{title(category)}</p>
      {categoryMembers.map((member) => (
        <div className="member-container" key={member.id} data-id={member.id}>
          <CatPongImage
            user={member}
            onClick={() => navigate("/home/profile/" + member.id)}
          />
          <ShowStatus
            member={member}
            dontShow={category === "banned"}
            styleOnOffline={{
              position: "absolute",
              transform: "translate(370%, 160%)",
            }}
            styleInGame={{
              position: "absolute",
              transform: "translate(-80%, 40%)",
            }}
          />
          <div className="member-name-container">
            <p className="member-name">{member.name}</p>
          </div>
          {children}
        </div>
      ))}
    </>
  ) : null;
}

function title(name: string) {
  let words = name.split("-");
  words = words.map((word) => word[0].toUpperCase() + word.slice(1));
  return words.join(" ");
}

export function ShowStatus({
  member,
  dontShow,
  classNameOnOffline,
  classNameInGame,
  styleOnOffline,
  styleInGame,
}: ShowStatusProps) {
  const { chatSocket, setInGame } = useContext(SocketContext);
  const navigate = useNavigate();

  return member.status ? (
    member.status !== "ingame" ? (
      <div
        className={"member-status " + classNameOnOffline}
        style={{
          backgroundColor:
            member.status === "online" ? "var(--online)" : "var(--offline)",
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
                roomId: member.gameid,
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
