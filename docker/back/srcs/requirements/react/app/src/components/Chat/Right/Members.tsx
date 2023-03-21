import { useState, useEffect, useContext, createContext, useRef } from "react";

import Button from "react-bootstrap/Button";
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

function membersDatatoMembers(data: MembersData): Members {
  let members: Members = structuredClone(voidMembers);
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
  setMembers: React.Dispatch<React.SetStateAction<Members | undefined>>
) {
  // Admin
  setMembers((members) => {
    if (!members) return members;
    const isOwner = member.id === members.owner.id;
    if (!isOwner) return members;
    const ownerCp = { ...members.owner };
    ownerCp.status = member.status;
    ownerCp.gameid = member.status === "ingame" ? member.gameid : undefined;
    return { ...members, owner: ownerCp };
  });
  // Others
  const updateStatus = (category: "admins" | "members" | "muted") => {
    setMembers((members) => {
      if (!members) return members;
      const categoryArr = members[category];
      if (!categoryArr || categoryArr.length === 0) return members;
      const index = categoryArr.findIndex((c) => c.id === member.id);
      if (index === -1) return members;
      const arrayCp = [...categoryArr];
      arrayCp.splice(index, 1, {
        ...arrayCp[index],
        status: member.status,
        gameid: member.status === "ingame" ? member.gameid : undefined,
      });
      arrayCp.sort((a, b) => {
        if (a.status === b.status) return 0;
        if (a.status === "ingame" || b.status === "ingame") {
          if (a.status === "ingame") return -1;
          return 1;
        }
        if (a.status === "online") return -1;
        return 1;
      });
      return { ...members, [category]: arrayCp };
    });
  };
  updateStatus("admins");
  updateStatus("members");
  updateStatus("muted");
}

function getIdInParent(eventTarget: EventTarget): string | null {
  let node = eventTarget as HTMLDivElement;
  while (node && !node.getAttribute("data-id"))
    node = node.parentNode as HTMLDivElement;
  return node.getAttribute("data-id");
}

function bannedOrMutedToMembers(
  id: string,
  setMembers: React.Dispatch<React.SetStateAction<Members | undefined>>
) {
  setMembers((members) => {
    const key = members?.muted?.find((m) => m.id === id) ? "muted" : "banned";
    if (!members) return members;
    const mutedOrBanned = members[key];
    if (!mutedOrBanned) return members;
    const index = mutedOrBanned.findIndex((m) => m.id === id);
    if (index === -1) return members;
    if (key === "muted") members.members.push(mutedOrBanned[index]);
    mutedOrBanned.splice(index, 1);
    return { ...members, [key]: mutedOrBanned };
  });
}

function SanctionTime({ sanctionned, setMembers }: SanctionTimeProps) {
  const [time, setTime] = useState<number | null>();
  const [updateTimeInterval, setUpdateTimeInterval] =
    useState<NodeJS.Timeout>();
  const [intervalMinutes, setIntervalMinutes] = useState<boolean>();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && sanctionned && !updateTimeInterval) {
      const id = getIdInParent(ref.current);
      if (!id) return;
      const setDiffTime = () => {
        let time = member?.time
          ? new Date(member.time).getTime() - Date.now()
          : null;
        if (time && time <= 0) {
          time = 0;
          bannedOrMutedToMembers(id, setMembers);
        }
        setTime(time);
        return time;
      };
      const member = sanctionned.find((m) => m.id === id);
      const time = setDiffTime();
      if (time) {
        const OneHourAnd1MnInMs = 1000 * 60 * 61;
        const timeGreaterThan1h = time > OneHourAnd1MnInMs;
        setIntervalMinutes(timeGreaterThan1h);
        setUpdateTimeInterval(
          setInterval(
            () => {
              const time = setDiffTime();
              setIntervalMinutes((intervalMinutes) => {
                if (time && time <= OneHourAnd1MnInMs && intervalMinutes) {
                  setIntervalMinutes(false);
                  clearInterval(updateTimeInterval);
                  setUpdateTimeInterval(
                    setInterval(() => {
                      setDiffTime();
                    }, 1000)
                  );
                }
                return intervalMinutes;
              });
            },
            timeGreaterThan1h ? 1000 * 60 : 1000
          )
        );
      }
    }
  }, [intervalMinutes, sanctionned, updateTimeInterval, setMembers]);

  useEffect(() => {
    return () => clearInterval(updateTimeInterval);
  }, [updateTimeInterval]);

  return time !== null ? (
    <div ref={ref} className="sanction-time">
      {time !== undefined && formatDiffTime(time)}
    </div>
  ) : null;
}

function formatDiffTime(diffInMs: number) {
  const diffInSeconds = diffInMs / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;

  if (diffInSeconds < 60) return `${Math.floor(diffInSeconds)}s`;
  else if (diffInMinutes < 60) {
    const diffInSecondsRounded = Math.floor(diffInSeconds % 60);
    return `${Math.floor(diffInMinutes)}m ${diffInSecondsRounded}s`;
  } else if (diffInHours < 24) {
    const diffInMinutesRounded = Math.floor(diffInMinutes % 60);
    return (
      `${Math.floor(diffInHours)}h` +
      (diffInMinutesRounded !== 0 ? ` ${diffInMinutesRounded}m` : "")
    );
  } else if (diffInHours < 24 * 365) {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  } else {
    const diffInYears = Math.floor(diffInHours / (24 * 365));
    return `${diffInYears}y`;
  }
}
