import ProfileCard from "../components/ProfileCard";
import BasicInfo from "../components/BasicInfo";
import UserHistory from "../components/UserHistory";
import Scoreboard from "../components/Scoreboard";
import "../styles/Profile.css";

const ProfilePage = () => {
  return (
    <div className="profile-page-container">
      <h2 className="profile-page-title">User Profile</h2>
      <div className="profile-content-grid">
        <div className="profile-section">
          <ProfileCard />
          <BasicInfo />
        </div>
        <div className="history-section">
          <UserHistory />
          <Scoreboard />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;