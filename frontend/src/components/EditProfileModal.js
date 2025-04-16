import { useState } from "react";
import { X } from "lucide-react";
import "../styles/EditProfileModal.css";

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    photo: user.photo || "",
    gender: user.gender || "",
    age: user.age || "",
    bloodGroup: user.bloodGroup || "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, photo: "Image must be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, photo: reader.result });
        setErrors({ ...errors, photo: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-panel">
      <div className="modal-header">
        <div className="modal-title-container">
          <h2 className="modal-title">
            {user.phone ? 'Edit Profile' : 'Complete Your Profile'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="modal-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      <div className="modal-body">
        <div className="photo-upload-section">
          <div className="photo-preview-container">
            {formData.photo ? (
              <img
                src={formData.photo}
                alt="Profile"
                className="photo-preview"
              />
            ) : (
              <div className="photo-placeholder">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <label className="photo-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="photo-upload-input"
              />
              <span className="photo-upload-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </label>
          </div>
          {errors.photo && (
            <p className="error-message">{errors.photo}</p>
          )}
          <p className="photo-upload-hint">
            Click to upload photo (max 2MB)
          </p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && (
              <p className="error-message">{errors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="10 digits without spaces"
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="form-input"
              min="1"
              max="120"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="modal-footer">
        <button
          onClick={onClose}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="save-btn"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;