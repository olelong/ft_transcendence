import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import CatPongImage from "../../../components/CatPongImage";
import ShowStatus from "../../../components/ShowStatus";

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
  ): Members & { owner: UserSocket[] } => {
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
            user={member}
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
