import { useState, useEffect } from "react";
import EditProfileModal from "./EditProfileModal";
import { Edit } from "lucide-react";
import "../styles/ProfileCard.css";


const ProfileCard = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    photo: "",
    phone: "",
    gender: "",
    age: "",
    bloodGroup: "",
  });

  useEffect(() => {
    setCurrentUser({
      name: user?.name || "",
      email: user?.email || "",
      photo: user?.photo || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      age: user?.age || "",
      bloodGroup: user?.bloodGroup || "",
    });
  }, [user]);

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    setIsModalOpen(false);
  };

  return (
    <div className="profile-card">
      <div className="profile-content">
        <div className="profile-avatar-container">
          {currentUser.photo ? (
            <img
              src={currentUser.photo}
              alt="Profile"
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {currentUser.name
                ? currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "?"}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h3 className="profile-name">
            {currentUser.name || "No name provided"}
          </h3>
          <p className="profile-email">{currentUser.email || "No email provided"}</p>
          
          {currentUser.phone && (
            <p className="profile-phone">
              <svg className="phone-icon" viewBox="0 0 24 24">
                <path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.5-5.2-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.4-.5-3.6 0-.5-.5-1-1-1H4c-.5 0-1 .5-1 1 0 9.4 7.6 17 17 17 .5 0 1-.5 1-1v-3.5c0-.5-.5-1-1-1z"/>
              </svg>
              {currentUser.phone}
            </p>
          )}

          <button
            className="profile-edit-btn"
            onClick={() => setIsModalOpen(true)}
            aria-label={currentUser.phone ? "Edit Profile" : "Complete Profile"}
          >
            <Edit size={16} className="btn-icon" />
            {currentUser.phone ? 'Edit Profile' : 'Complete Profile'}
          </button>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isModalOpen}
        user={currentUser} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default ProfileCard;