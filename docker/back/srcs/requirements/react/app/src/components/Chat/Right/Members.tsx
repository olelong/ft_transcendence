import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Spinner from "react-bootstrap/Spinner";

import { ConvContext } from "../../../pages/Chat";
import { SocketContext } from "../../../components/Header";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Right/Members.css";

export default function Members() {
  const { currConv } = useContext(ConvContext);
  const { chatSocket } = useContext(SocketContext);
  const [members, setMembers] = useState<Members>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!members) {
      fetch(serverUrl + "/chat/channels/" + currConv.id, {
        credentials: "include",
      })
        .then((res) => {
          if (res.status === 200) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data: MembersData) => {
          chatSocket.emit("user:status", {
            users: data.members.map((m) => m.id),
          });
          setMembers(membersDatatoMembers(data));
        })
        .catch(console.error);
    }

    if (members) {
      chatSocket.on("user:status", (member) => {
        console.log(member);
        const isOwner = member.id === members.owner.id;
        if (isOwner) {
          const membersCp = { ...members };
          membersCp.owner.status = member.status;
          setMembers(membersCp);
        }
      });
    }
  }, [currConv.id, chatSocket, members]);

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
            <div
              className="member-status"
              style={{
                backgroundColor:
                  members.owner.status === "online" ? "var(--online)" : "",
              }}
            />
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
