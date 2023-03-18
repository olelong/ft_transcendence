import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Spinner from "react-bootstrap/Spinner";
import { GoEye } from "react-icons/go";

import { ConvContext } from "../../../pages/Chat";
import { SocketContext } from "../../../components/Header";
import InGameCheckWrapper from "../../../components/InGameCheckWrapper";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Right/Members.css";

export default function Members() {
  const { currConv } = useContext(ConvContext);
  const { chatSocket } = useContext(SocketContext);
  const [members, setMembers] = useState<Members>();
  const [membersFetched, setMembersFetched] = useState(false);
  const [onUserStatus, setOnUserStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(members, membersFetched, onUserStatus);
    if (!members && !membersFetched) {
      console.log("fetch");
      setMembersFetched(true);
      fetch(serverUrl + "/chat/channels/" + currConv.id, {
        credentials: "include",
      })
        .then((res) => {
          if (res.status === 200) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data: MembersData) => {
          console.log("in fetch", members);
          setMembers(membersDatatoMembers(data));
        })
        .catch(console.error);
    }

    if (members && !onUserStatus) {
      setOnUserStatus(true);
      let users = [members.owner.id];
      users.concat(members.admins.map((m) => m.id));
      users.concat(members.members.map((m) => m.id));
      if (members.banned) users.concat(members.banned.map((m) => m.id));
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
          <p className="title">Owner</p>
          <div className="member-container">
            <div
              className="member-avatar-container"
              onClick={() => navigate("/home/profile/" + members.owner.id)}
            >
              <img
                src={serverUrl + members.owner.avatar}
                alt={members.owner.name + "'s avatar"}
              />
            </div>
            {members.owner.status ? (
              members.owner.status !== "ingame" ? (
                <div
                  className="member-status"
                  style={{
                    backgroundColor:
                      members.owner.status === "online"
                        ? "var(--online)"
                        : "var(--offline)",
                  }}
                />
              ) : (
                <InGameCheckWrapper>
                  <GoEye
                    className="member-status-ingame"
                    onClick={() => console.log("salut")}
                  />
                </InGameCheckWrapper>
              )
            ) : (
              <div className="member-status" />
            )}
            <div className="member-name-container">
              <p className="member-name">{members.owner.name}</p>
            </div>
          </div>
        </div>
      ) : (
        <Spinner style={{ width: "100px", height: "100px", margin: "auto" }} />
      )}
    </div>
  );
}

function membersDatatoMembers(data: MembersData): Members {
  let members: Members = {
    owner: { id: "", name: "", avatar: "" },
    admins: [],
    members: [],
  };
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
  console.log(member);
  const isOwner = member.id === members.owner.id;
  if (isOwner) {
    const ownerCp = { ...members.owner };
    ownerCp.status = member.status;
    ownerCp.gameid = member.status === "ingame" ? member.gameid : undefined;
    setMembers({ ...members, owner: ownerCp });
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
      setMembers({ ...members, [category]: arrayCp });
    }
  };
  updateStatus("admins");
  updateStatus("members");
  updateStatus("muted");
}
