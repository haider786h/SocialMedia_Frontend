import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UploadProfile.css';

const UploadProfile = () => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
   const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImage) {
      alert("Please select an image.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", profileImage);

    try {
      const res = await axios.post(`${Base_Url}/api/users/upload-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const imageUrl = res.data.imageUrl;
      console.log("Uploaded image URL:", imageUrl);

      // Store in localStorage and notify header
      localStorage.setItem("profileImage", imageUrl);
    //   window.dispatchEvent(new Event("profile-updated")); 

      alert("Profile updated!");
      navigate('/')
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <nav className="top-nav">
        <Link to="/">⬅️ NewsFeed</Link>
      </nav>

      <div className="upload-profile-container">
        <h2>Upload Your Profile Picture</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          <button type="submit">Upload</button>
        </form>

        {previewURL && (
          <div>
            <h3>Preview</h3>
            <img src={previewURL} alt="Profile Preview" className="Profile-img" />
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProfile;
