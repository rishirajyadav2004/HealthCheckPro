const BasicInfo = ({ user }) => {
  // Format the member since date
  const formatMemberSince = (date) => {
    if (!date) return "Not specified";
    const options = { year: 'numeric', month: 'long' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const fields = [
    { label: "Name", value: user?.name || "Not specified", icon: "👤" },
    { label: "Gender", value: user?.gender || "Not specified", icon: "♀♂" },
    { label: "Age", value: user?.age ? `${user.age} years` : "Not specified", icon: "🎂" },
    { label: "Username", value: user?.username || "Not specified", icon: "🏷️" },
    { label: "Email", value: user?.email || "Not specified", icon: "✉️" },
    { label: "Member Since", value: user?.createdAt ? formatMemberSince(user.createdAt) : "Not specified", icon: "📅" },
  ];

  return (
    <div className="basic-info-card">
      <h3 className="basic-info-title">Basic Information</h3>
      <div className="basic-info-grid">
        {fields.map((field, index) => (
          <div key={index} className="basic-info-item">
            <div className="basic-info-icon">{field.icon}</div>
            <div>
              <p className="basic-info-label">{field.label}</p>
              <p className="basic-info-value">{field.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicInfo;