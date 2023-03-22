import { useState, useEffect, useContext, createContext } from "react";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";

import MembersCategory from "./MembersCategory";
import SanctionTime from "./SanctionTime";
import {
  membersDatatoMembers,
  updateMemberStatus,
  getIdInParent,
  changeRole,
  changeRoleFetch,
  ChangeRoleSelect,
  measureStringWidth,
  truncateString,
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
  const [ownerModal, setOwnerModal] = useState({
    show: false,
    id: "",
    name: "",
  });

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
      changeRole(id, "members", setMembers);
      chatSocket?.emit("user:sanction", {
        id: currConv.id,
        userid: id,
        type: sanction,
        add: false,
      });
    }
  };

  const handleRoleChange = (role: string, id: string) => {
    if (role === "owner") {
      const user =
        members?.admins.find((a) => a.id === id) ||
        members?.members.find((m) => m.id === id);
      if (!user) return;
      setOwnerModal({ show: true, id: id, name: user.name });
    } else {
      changeRole(id, role === "admin" ? "admins" : "members", setMembers);
      changeRoleFetch(currConv.id as number, id, role);
    }
  };

  return (
    <div className="display-members-container">
      {members && chatSocket ? (
        <div className="members-container">
          <MembersContext.Provider value={{ members }}>
            <MembersCategory category="owner" />
            <MembersCategory category="admins">
              {/* <svg
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                fill-rule="evenodd"
                clip-rule="evenodd"
                fill="var(--violet)"
              >
                <path d="M0 22h12v2h-12v-2zm11-1h-10c0-1.105.895-2 2-2h6c1.105 0 2 .895 2 2zm6.369-12.839l-2.246 2.197s6.291 5.541 8.172 7.144c.475.405.705.929.705 1.446 0 1.015-.888 1.886-1.95 1.819-.52-.032-.981-.303-1.321-.697-1.619-1.875-7.07-8.249-7.07-8.249l-2.245 2.196-5.857-5.856 5.957-5.857 5.855 5.857zm-12.299.926c-.195-.193-.458-.302-.733-.302-.274 0-.537.109-.732.302-.193.195-.303.458-.303.733 0 .274.11.537.303.732l5.513 5.511c.194.195.457.304.732.304.275 0 .538-.109.732-.304.194-.193.303-.457.303-.732 0-.274-.109-.537-.303-.731l-5.512-5.513zm8.784-8.784c-.195-.194-.458-.303-.732-.303-.576 0-1.035.467-1.035 1.035 0 .275.108.539.303.732l5.513 5.513c.194.193.456.303.731.303.572 0 1.036-.464 1.036-1.035 0-.275-.109-.539-.304-.732l-5.512-5.513z" />
              </svg> */}
              {role === "owner" && (
                <div className="role-select">
                  <ChangeRoleSelect
                    value={{ value: "admin", label: "Admin" }}
                    onChange={handleRoleChange}
                  />
                </div>
              )}
            </MembersCategory>
            <MembersCategory category="members">
              {role === "owner" && (
                <div className="role-select">
                  <ChangeRoleSelect
                    value={{ value: "member", label: "Member" }}
                    onChange={handleRoleChange}
                  />
                </div>
              )}
            </MembersCategory>
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
          <Modal
            show={ownerModal.show}
            onHide={() => setOwnerModal({ id: "", name: "", show: false })}
          >
            <Modal.Header closeButton closeVariant="white">
              <Modal.Title>Are you sure?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Setting{" "}
              {measureStringWidth(ownerModal.name, "Montserrat") < 460
                ? ownerModal.name
                : truncateString(ownerModal.name, 460)}{" "}
              as owner will remove all your owner's rights and designate you as
              an administrator.
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="light-button"
                onClick={() => setOwnerModal({ id: "", name: "", show: false })}
              >
                Discard
              </Button>
              <Button
                className="purple-button"
                onClick={() => {
                  changeRole(members.owner.id, "admins", setMembers);
                  changeRole(ownerModal.id, "owner", setMembers);
                  changeRoleFetch(
                    currConv.id as number,
                    ownerModal.id,
                    "owner"
                  );
                  setRole("admin");
                  setOwnerModal({ id: "", name: "", show: false });
                }}
              >
                Make{" "}
                {measureStringWidth(ownerModal.name, "Montserrat") < 160
                  ? ownerModal.name
                  : truncateString(ownerModal.name, 160)}{" "}
                the new owner
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <Spinner style={{ width: "100px", height: "100px", margin: "auto" }} />
      )}
    </div>
  );
}
