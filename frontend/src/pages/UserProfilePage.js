import React from 'react';
import { useLocation } from 'react-router-dom';
import ProfileCard from "../components/ProfileCard";
import BasicInfo from "../components/BasicInfo";

const UserProfilePage = () => {
  const location = useLocation();
  const user = location.state?.user || {
    name: "",
    email: "",
    photo: "",
    phone: "",
    gender: "",
    age: "",
    bloodGroup: "",
  };

  return (
    <div className="profile-page-container">
      <div className="profile-page-content">
        <h2 className="profile-page-title">User Profile</h2>
        <ProfileCard user={user} />
        <BasicInfo user={user} />
      </div>
    </div>
  );
};

export default UserProfilePage;