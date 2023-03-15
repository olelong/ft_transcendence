import { useState, useEffect, useContext } from "react";

import { ConvContext } from "../../../pages/Chat";
import { serverUrl } from "../../../index";

export default function Members() {
  const { currConv } = useContext(ConvContext);
  const [members, setMembers] = useState<Members>();

  useEffect(() => {
    fetch(serverUrl + "/chat/channels/" + currConv.id, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error(res.status + ": " + res.statusText);
      })
      .then((data: MembersData) => setMembers(membersDatatoMembers(data)))
      .catch(console.error);
  }, [currConv.id]);

  return <div></div>;
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
  console.log(members);
  return members;
}
