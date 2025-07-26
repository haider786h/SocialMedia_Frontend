import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, User, Settings, LogOut, Upload, FolderOpen, MessageCircle, Users, UserPlus, Plus, Search, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './Header.css';

const Header = ({ onLogOut, setIsLoggedIn, isLoggedIn }) => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [userImage, setUserImage] = useState('');
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const defaultImage =
    'https://static.vecteezy.com/system/resources/previews/001/840/612/non_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg';

  const fetchProfile = async () => {
    if (!isLoggedIn) {
      setUserImage('');
      setUsername('');
      return;
    }

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setIsLoggedIn(false);
      setUserImage('');
      setUsername('');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`${Base_Url}/api/users/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
        withCredentials: true,
      });

      const data = res.data;
      setUsername(data.name || 'User');
      setUserImage(data.profileImage || localStorage.getItem('profileImage') || defaultImage);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
      }
      setUserImage(defaultImage);
      setUsername('');
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleProfileUpdate = () => {
      if (isLoggedIn) {
        const latestImage = localStorage.getItem('profileImage');
        if (latestImage) setUserImage(latestImage);
      }
    };

    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setIsLoggedIn(false);
        setUserImage('');
        setUsername('');
        navigate('/login');
      } else if (isLoggedIn) {
        fetchProfile();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isLoggedIn, navigate, setIsLoggedIn]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setShowDropdown(false);
    onLogOut?.();
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    setErrorMessage('');
    setSuccessMessage('');
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const goToEditProfile = () => {
    setShowDropdown(false);
    navigate('/upload-profile');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or GIF).');
      setSuccessMessage('');
      return;
    }
    if (file.size > maxSize) {
      setErrorMessage('File size exceeds 5MB limit.');
      setSuccessMessage('');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setSuccessMessage('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setErrorMessage('');
    setSuccessMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    const formData = new FormData();
    
    // Use 'image' field name to match UploadProfile component
    formData.append('image', selectedFile);

    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setErrorMessage('Session expired. Please log in again.');
        setIsLoggedIn(false);
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${Base_Url}/api/users/upload-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      // Handle response based on UploadProfile structure
      const imageUrl = response.data.imageUrl;
      if (imageUrl) {
        setUserImage(imageUrl);
        localStorage.setItem('profileImage', imageUrl);
        window.dispatchEvent(new CustomEvent('profile-updated'));
        setSelectedFile(null);
        setPreviewImage(null);
        setSuccessMessage('Profile picture updated successfully!');
        setTimeout(() => {
          setShowDropdown(false);
          setSuccessMessage('');
        }, 2000); // Close dropdown after 2 seconds
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      const status = error.response?.status;
      const serverMessage = error.response?.data?.error || 'Failed to upload image.';
      if (status === 401) {
        setErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
      } else if (status === 400) {
        setErrorMessage(serverMessage || 'Invalid image file. Please try another file.');
      } else if (status === 500) {
        setErrorMessage('Server error. Please try again later or contact support.');
      } else {
        setErrorMessage(serverMessage || 'Failed to upload image. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedFile(null);
        setPreviewImage(null);
        setErrorMessage('');
        setSuccessMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="custom-header">
      <div className="logo">
        <Camera size={32} className="logo-icon" />
        <span className="logo-text">Postify</span>
      </div>

      {isLoggedIn && (
        <nav className="top-nav">
          <ul>
            <li>
              <Link to="/friendreq">
                <UserPlus size={18} />
                Friend Requests
              </Link>
            </li>
            <li>
              <Link to="/chat">
                <MessageCircle size={18} />
                Chat
              </Link>
            </li>
            <li>
              <Link to="/friends">
                <Users size={18} />
                Friends
              </Link>
            </li>
            <li>
              <Link to="/post">
                <Plus size={18} />
                Create Post
              </Link>
            </li>
            <li>
              <Link to="/search-user">
                <Search size={18} />
                Find Friends
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {isLoggedIn && (
        <div className="user-info" ref={dropdownRef}>
          <span className="Username">{username || 'User'}</span>
          <div className="profile-container" onClick={toggleDropdown}>
            <img
              src={userImage || defaultImage}
              alt="Profile"
              className="profile-img"
            />
            <span className="online-indicator"></span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              {/* Profile Header */}
              <div className="dropdown-profile-section">
                <img
                  src={previewImage || userImage || defaultImage}
                  alt="Profile"
                  className="dropdown-profile-img"
                />
                <div className="dropdown-user-info">
                  <h4>{username || 'User'}</h4>
                  <p>
                    <span className="status-dot"></span>
                    Active now
                  </p>
                </div>
              </div>

              {/* Messages */}
              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="success-message">
                  <CheckCircle size={16} />
                  {successMessage}
                </div>
              )}

              {/* Quick Upload Section */}
              <div className="upload-section">
                <div className="upload-header">
                  <Camera size={16} />
                  Update Profile Picture
                </div>
                <div className="upload-container">
                  <div className="upload-preview-container">
                    <img
                      src={previewImage || userImage || defaultImage}
                      alt="Upload Preview"
                      className="upload-preview"
                    />
                    {isUploading && (
                      <div className="upload-progress-overlay">
                        <div className="upload-progress-bar"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="file-input-wrapper">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="file-upload" className="file-input-label">
                      <FolderOpen size={16} />
                      Choose Photo
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="upload-actions">
                      <button
                        className="upload-btn"
                        onClick={handleUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <div className="loading-spinner"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Upload Photo
                          </>
                        )}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={handleCancelUpload}
                        disabled={isUploading}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="dropdown-menu-section">
                <button className="dropdown-menu-item" onClick={goToEditProfile}>
                  <Settings size={18} className="menu-item-icon" />
                  Edit Full Profile
                </button>
                
                <button className="dropdown-menu-item">
                  <User size={18} className="menu-item-icon" />
                  View Profile
                </button>
                
                <button className="dropdown-menu-item logout-item" onClick={handleLogout}>
                  <LogOut size={18} className="menu-item-icon" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;