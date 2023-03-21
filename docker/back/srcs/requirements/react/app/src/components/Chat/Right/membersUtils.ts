import { voidMembers } from "./Members";

export function membersDatatoMembers(data: MembersData): Members {
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

export function updateMemberStatus(
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

export function getIdInParent(eventTarget: EventTarget): string | null {
  let node = eventTarget as HTMLDivElement;
  while (node && !node.getAttribute("data-id"))
    node = node.parentNode as HTMLDivElement;
  return node.getAttribute("data-id");
}

export function bannedOrMutedToMembers(
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
