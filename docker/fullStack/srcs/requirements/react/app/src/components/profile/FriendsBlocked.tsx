import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";
import { useEffect, useState } from "react";
import { BlockAUser } from "./ProfileInfos";
import { User } from "../../types/profile.interface";
import { serverUrl } from "index";

export default function FriendsBlocked({ isBlocked, setIsBlocked }: any) {
  const [blockedList, setBlockedList] = useState<User[]>();
  const [nbUserBlocked, setNbUserBlocked] = useState<number>(0);

  // Get the blocked user list
  useEffect(() => {
    fetch(serverUrl + "/user/blocks/", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status >= 200 && res.status < 300)
          return res.json();})
      .then((data) => {
        setBlockedList(data.users);
        setNbUserBlocked(data.users.length);
      })
      .catch(() => {});
  }, [nbUserBlocked]);

  return (
    <div
      className="user-blocked-global"
      style={{ overflowY: nbUserBlocked >= 8 ? "scroll" : "hidden" }}
    >
      {blockedList &&
        blockedList.map((user: any) => (
          <div key={user.id} className="user-blocked-div">
            <img
              src={user && serverUrl + user.avatar}
              alt="avatar of a user blocked"
              className="user-blocked-avatar"
            />
            <p className="user-blocked-p">{user && user.name}</p>
            <button
              className="user-unblocked-button"
              type="submit"
              onClick={(e: any) => {
                e.preventDefault();
                setIsBlocked(false);
                BlockAUser(user.id, false, blockedList, setBlockedList);
              }}
            >
              Unblock
            </button>
          </div>
        ))}
    </div>
  );
}

/* 
Map permet d'appliquer une fonction à chaque element du blockedList 
et la key est le id du user car elle doit permettre de reconnaitre un 
element et doit etre unique.
*/
