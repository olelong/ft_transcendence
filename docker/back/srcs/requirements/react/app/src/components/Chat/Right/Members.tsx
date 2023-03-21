import { useState, useEffect, useContext, createContext } from "react";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import MembersCategory from "./MembersCategory";
import SanctionTime from "./SanctionTime";
import {
  membersDatatoMembers,
  updateMemberStatus,
  getIdInParent,
  bannedOrMutedToMembers,
} from "./membersUtils";
import { ConvContext } from "../../../pages/Chat";
import { SocketContext } from "../../../components/Header";
import { serverUrl } from "../../../index";

import "../../../styles/Chat/Right/Members.css";

export const voidMembers = {
  owner: { id: "", name: "", avatar: "" },
  admins: [],
  members: [],
};
export const MembersContext = createContext<{ members: Members }>({
  members: structuredClone(voidMembers),
});

export default function Members() {
  const { currConv } = useContext(ConvContext);
  const { chatSocket } = useContext(SocketContext);
  const [members, setMembers] = useState<Members>();
  const [membersFetched, setMembersFetched] = useState(false);
  const [onUserStatus, setOnUserStatus] = useState(false);
  const [role, setRole] = useState<string>();

  useEffect(() => {
    if (!members && !membersFetched) {
      setMembersFetched(true);
      fetch(serverUrl + "/chat/channels/" + currConv.id, {
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) return res.json();
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
        updateMemberStatus(member, setMembers)
      );
    }

    if (!role) {
      fetch(serverUrl + "/chat/channels/" + currConv.id + "/role", {
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error(res.status + ": " + res.statusText);
        })
        .then((data) => setRole(data.role))
        .catch(console.error);
    }
  }, [currConv.id, chatSocket, members, membersFetched, onUserStatus, role]);

  useEffect(() => {
    return () => {
      chatSocket?.off("user:status");
    };
  }, [chatSocket]);

  const unSanction = (sanction: "ban" | "mute", eventTarget: EventTarget) => {
    const id = getIdInParent(eventTarget);
    if (id) {
      bannedOrMutedToMembers(id, setMembers);
      chatSocket?.emit("user:sanction", {
        id: currConv.id,
        userid: id,
        type: sanction,
        add: false,
      });
    }
  };

  return (
    <div className="display-members-container">
      {members && chatSocket ? (
        <div className="members-container">
          <MembersContext.Provider value={{ members }}>
            <MembersCategory category="owner" />
            <MembersCategory category="admins" />
            <MembersCategory category="members" />
            <MembersCategory category="muted">
              <SanctionTime
                sanctionned={members.muted}
                setMembers={setMembers}
              />
              <Button
                className="member-button"
                onClick={(e) => unSanction("mute", e.target)}
              >
                Unmute
              </Button>
            </MembersCategory>
            <MembersCategory category="banned">
              <SanctionTime
                sanctionned={members.banned}
                setMembers={setMembers}
              />
              <Button
                className="member-button"
                onClick={(e) => unSanction("ban", e.target)}
              >
                Unban
              </Button>
            </MembersCategory>
          </MembersContext.Provider>
        </div>
      ) : (
        <Spinner style={{ width: "100px", height: "100px", margin: "auto" }} />
      )}
    </div>
  );
}
