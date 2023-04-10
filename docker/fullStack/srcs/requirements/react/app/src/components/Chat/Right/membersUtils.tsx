import { useRef } from "react";
import Select, { CSSObjectWithLabel, Props as SelectProps } from "react-select";

import { voidMembers } from "./Members";
import { serverUrl } from "../../../index";

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
  member: UserStatusEvData,
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
  while (!node.getAttribute("data-id")) {
    node = node.parentNode as HTMLDivElement;
    if (node === document.body) return null;
  }
  return node.getAttribute("data-id");
}

export function changeRole(
  id: string,
  to: keyof Members,
  setMembers: React.Dispatch<React.SetStateAction<Members | undefined>>,
  time?: Date
) {
  setMembers((members) => {
    if (!members) return members;
    let from: keyof Members | null = null;
    let fromArr;
    const containsOrIsEqual = (val: UserSocket | UserSocket[]) => {
      if (Array.isArray(val)) {
        if (val.find((m) => m.id === id)) return true;
      } else if (val.id === id) return true;
      return false;
    };
    for (const [key, value] of Object.entries(members) as [
      keyof Members,
      UserSocket | UserSocket[]
    ][]) {
      if (containsOrIsEqual(value)) {
        fromArr = value;
        from = key;
        break;
      }
    }
    let toArr = members[to];
    if (!from || !fromArr || !toArr) return members;
    // Remove from member from its array
    const fromMember = Array.isArray(fromArr)
      ? fromArr.find((m) => m.id === id)
      : members.owner;
    if (!fromMember) return members;
    if (Array.isArray(fromArr))
      fromArr.splice(
        fromArr.findIndex((m) => m.id === id),
        1
      );
    else fromArr = { id: "", name: "", avatar: "" };
    if (to === "banned") delete fromMember.status;
    // Add from member to new array
    if (from !== "banned") {
      if (Array.isArray(toArr))
        toArr.push({
          ...fromMember,
          time: to === "muted" || to === "banned" ? time : undefined,
        });
      else
        toArr = {
          ...fromMember,
          time: to === "muted" || to === "banned" ? time : undefined,
        } as UserSocket;
    }
    return { ...members, [from]: fromArr, [to]: toArr };
  });
}

export function changeRoleFetch(chanid: number, id: string, role: string) {
  fetch(serverUrl + "/chat/channels/" + chanid + "/role", {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, role }),
  });
}

/* React Select Options */
const options = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];
export const customSelectStyles = {
  option: (
    defaultStyles: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...defaultStyles,
    color: "var(--white)",
    backgroundColor: state.isSelected
      ? "var(--violet)"
      : state.isFocused
      ? "var(--shadow)"
      : "var(--light)",
    ":active": { backgroundColor: "var(--violet)" },
    cursor: "pointer",
  }),
  control: (defaultStyles: CSSObjectWithLabel) => ({
    ...defaultStyles,
    backgroundColor: "var(--light-white)",
    "&:hover": { backgroundColor: "var(--white)" },
    "@media (min-width: 992px)": { marginTop: "10px" },
    minWidth: "65px",
    maxWidth: "200px",
    border: "none",
    boxShadow: "none",
    borderRadius: "10px",
    cursor: "pointer",
  }),
  singleValue: (defaultStyles: CSSObjectWithLabel) => ({
    ...defaultStyles,
    color: "var(--rose)",
  }),
  dropdownIndicator: (defaultStyles: CSSObjectWithLabel) => ({
    ...defaultStyles,
    display: "none",
  }),
};

export function ChangeRoleSelect({
  onChange,
  ...rest
}: Omit<SelectProps, "onChange"> & {
  onChange: (value: string, id: string) => void;
}) {
  const ref = useRef(null);
  return (
    <Select
      {...rest}
      ref={ref}
      onChange={(selectedOption: any) => {
        if (ref.current) {
          const id = getIdInParent((ref.current as any).controlRef);
          if (id) onChange(selectedOption.value, id);
        }
      }}
      options={options}
      styles={customSelectStyles}
      isSearchable={false}
    />
  );
}

export function measureStringWidth(str: string, font: string) {
  // create a temporary span element to measure the string width
  let span = document.createElement("span");
  span.style.font = font;
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.textContent = str;
  document.body.appendChild(span);

  // get the width of the span element
  let width = span.getBoundingClientRect().width;

  // remove the temporary span element from the document
  document.body.removeChild(span);

  // return the width of the string in pixels
  return width;
}

export function truncateString(str: string, width: number) {
  for (let i = 0; i < str.length; i--) {
    if (measureStringWidth(str + "...", "Montserrat") < width) break;
    str = str.slice(0, -1);
  }
  return str + "...";
}

export function timeObjectToFuturetime(time?: {
  days: number;
  hours: number;
  minutes: number;
}): string | undefined {
  if (!time) return undefined;
  const now = new Date();
  const addArtificialMinute = time.days || time.hours || now.getSeconds() > 30;
  now.setSeconds(0);
  now.setMilliseconds(0);
  now.setDate(now.getDate() + time.days);
  now.setHours(now.getHours() + time.hours);
  now.setMinutes(
    now.getMinutes() + time.minutes + (addArtificialMinute ? 1 : 0)
  );
  return now.toISOString();
}
