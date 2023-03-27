import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GoEye } from "react-icons/go";

import InGameCheckWrapper from "../../../components/InGameCheckWrapper";
import { SocketContext } from "../../../components/Header";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Right/MembersCategory.css";
import { MembersContext } from "./Members";

export default function MembersCategory({
  category,
  children,
}: MembersCategoryProps) {
  const { members } = useContext(MembersContext);
  const { chatSocket, setInGame } = useContext(SocketContext);
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
          <div
            className="member-avatar-container"
            onClick={() => navigate("/home/profile/" + member.id)}
          >
            <img
              src={serverUrl + member.avatar}
              alt={member.name + "'s avatar"}
            />
          </div>
          {member.status ? (
            member.status !== "ingame" ? (
              <div
                className="member-status"
                style={{
                  backgroundColor:
                    member.status === "online"
                      ? "var(--online)"
                      : "var(--offline)",
                }}
              />
            ) : (
              <InGameCheckWrapper>
                <GoEye
                  className="member-status-ingame"
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
          ) : (
            category !== "banned" && <div className="member-status" />
          )}
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
