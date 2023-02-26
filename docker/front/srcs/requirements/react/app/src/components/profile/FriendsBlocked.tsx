import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";
import { useEffect, useState } from "react";
import avatar from "../../assets/avatar/lapin.jpg";
import { BlockAUser } from "./ProfileInfos";
import { serverUrl } from "index";

export default function FriendsBlocked({ isBlocked, setIsBlocked }: any) {
  const [blockedList, setBlockedList] = useState<any>();
  const [nbUserBlocked, setNbUserBlocked] = useState<number>(0);

  // Get the blocked user list
  useEffect(() => {
    fetch(serverUrl + "/user/blocks/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setBlockedList(data);
        setNbUserBlocked(data.users.length);

        console.log("List Blocked user data:", data, blockedList);
        console.log(
          "Number of Blocked user:",
          data.users.length,
          nbUserBlocked
        );
      })
      .catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nbUserBlocked]);
  return (
    <div
      className="user-blocked-global"
      style={{ overflowY: nbUserBlocked >= 7 ? "scroll" : "hidden" }}
    >
      <div className="user-blocked-div">
        <img
          src={blockedList && serverUrl + blockedList.users[0].avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">
          {blockedList && blockedList.users[0].name}
        </p>
        <button
          className="user-unblocked-button"
          type="submit"
          onClick={(e: any) => {
            e.preventDefault();
            setIsBlocked(false);
            BlockAUser(blockedList.id, false);
          }}
        >
          Unblock
        </button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">123456789012345678901234567890</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">12345678901234</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">name2222222</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">name</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
      <div className="user-blocked-div">
        <img
          src={blockedList && serverUrl + blockedList.users[0].avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">
          {blockedList && blockedList.users[0].name}
        </p>
        <button
          className="user-unblocked-button"
          type="submit"
          onClick={(e: any) => {
            e.preventDefault();
            setIsBlocked(false);
            BlockAUser(blockedList.id, false);
          }}
        >
          Unblock
        </button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">123456789012345678901234567890</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">12345678901234</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">name2222222</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
      <div className="user-blocked-div">
        <img
          src={avatar}
          alt="avatar of a user blocked"
          className="user-blocked-avatar"
        />
        <p className="user-blocked-p">name</p>
        <button className="user-unblocked-button">Unblock</button>
      </div>
    </div>
  );
}
