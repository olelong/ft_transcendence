import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/profile/ProfileTabs.css";
import star from "../../assets/icons/star.png";

export default function FriendsBlocked() {
  return (
    <div className="user-blocked-global">
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' className="user-blocked-avatar" style={{width: "40px", borderRadius:"100%"}}/>
      <p className="user-blocked-p">name</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">123456789012345678901234567890</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">12345678901234</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">name2222222</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' className="user-blocked-avatar" style={{width: "40px", borderRadius:"100%"}}/>
      <p className="user-blocked-p">name</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">123456789012345678901234567890</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">12345678901234</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">name2222222</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
        <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">12345678901234</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    <div className="user-blocked-div">
      <img src={star} alt='avatar of a user blocked' style={{width: "40px"}}/>
      <p className="user-blocked-p">name2222222</p>
      <button className="user-unblocked-button">Unblock</button>
    </div>
    </div>
  );

}
