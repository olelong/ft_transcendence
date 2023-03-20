import { useState, useEffect, useContext, createContext } from "react";

import Spinner from "react-bootstrap/Spinner";

import MembersCategory from "./MembersCategory";
import { ConvContext } from "../../../pages/Chat";
import { SocketContext } from "../../../components/Header";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Right/Members.css";

const voidMembers = {
  owner: { id: "", name: "", avatar: "" },
  admins: [],
  members: [],
};
export const MembersContext = createContext<{ members: Members }>({
  members: voidMembers,
});

export default function Members() {
  const { currConv } = useContext(ConvContext);
  const { chatSocket } = useContext(SocketContext);
  const [members, setMembers] = useState<Members>();
  const [membersFetched, setMembersFetched] = useState(false);
  const [onUserStatus, setOnUserStatus] = useState(false);

  useEffect(() => {
    if (!members && !membersFetched) {
      setMembersFetched(true);
      fetch(serverUrl + "/chat/channels/" + currConv.id, {
        credentials: "include",
      })
        .then((res) => {
          if (res.status === 200) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data: MembersData) => setMembers(membersDatatoMembers(data)))
        .catch(console.error);
    }

    if (members && !onUserStatus && chatSocket) {
      setOnUserStatus(true);
      let users = [members.owner.id];
      users = users.concat(members.admins.map((m) => m.id));
      users = users.concat(members.members.map((m) => m.id));
      if (members.muted) users = users.concat(members.muted.map((m) => m.id));
      chatSocket.emit("user:status", { users });
      chatSocket.on("user:status", (member) =>
        updateMemberStatus(member, members, setMembers)
      );
    }
  }, [currConv.id, chatSocket, members, membersFetched, onUserStatus]);

  return (
    <div className="display-members-container">
      {members ? (
        <div className="members-container">
          <MembersContext.Provider value={{ members }}>
            <MembersCategory category="owner" />
            <MembersCategory category="admins" />
            <MembersCategory category="members" />
            <MembersCategory category="muted" />
            <MembersCategory category="banned" />
          </MembersContext.Provider>
        </div>
      ) : (
        <Spinner style={{ width: "100px", height: "100px", margin: "auto" }} />
      )}
    </div>
  );
}

function membersDatatoMembers(data: MembersData): Members {
  let members: Members = voidMembers;
  data.members = data.members.filter((m) => {
    if (m.id === data.owner) {
      members.owner = { ...m };
      return false;
    }
    return true;
  });
  data.members = data.members.filter((m) => {
    if (data.admins.includes(m.id)) {
      members.admins.push({ ...m });
      return false;
    }
    return true;
  });
  if (data.muted) members.muted = [];
  data.members = data.members.filter((m) => {
    const muted = data.muted?.find((muted) => muted.id === m.id);
    if (muted) {
      if (!members.muted) members.muted = [];
      members.muted.push({ ...m, time: muted.time });
      return false;
    }
    return true;
  });
  if (data.banned) members.banned = data.banned;
  members.members = data.members;
  return members;
}

function updateMemberStatus(
  member: UserStatusData,
  members: Members,
  setMembers: React.Dispatch<React.SetStateAction<Members | undefined>>
) {
  const isOwner = member.id === members.owner.id;
  if (isOwner) {
    const ownerCp = { ...members.owner };
    ownerCp.status = member.status;
    ownerCp.gameid = member.status === "ingame" ? member.gameid : undefined;
    setMembers((members) =>
      members ? { ...members, owner: ownerCp } : undefined
    );
  }
  const updateStatus = (category: "admins" | "members" | "muted") => {
    const categoryArr = members[category];
    if (!categoryArr) return;
    const index = categoryArr.findIndex((c) => c.id === member.id);
    if (index >= 0) {
      const arrayCp = [...categoryArr];
      arrayCp.splice(index, 1, {
        ...arrayCp[index],
        status: member.status,
        gameid: member.status === "ingame" ? member.gameid : undefined,
      });
      setMembers((members) =>
        members ? { ...members, [category]: arrayCp } : undefined
      );
    }
  };
  updateStatus("admins");
  updateStatus("members");
  updateStatus("muted");
}
