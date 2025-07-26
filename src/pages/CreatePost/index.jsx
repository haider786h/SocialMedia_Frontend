import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css';

const CreatePost = () => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const fileInputRef = useRef(null); 
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert("Please write a caption.");
    if (!image) return alert("Please select an image.");

    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', image);

    const token = localStorage.getItem('token');

    try {
      await axios.post(`${Base_Url}/api/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      alert('Post created Successfully!');
      navigate('/');
    } catch (error) {
      console.error("❌ Create Post Error:", error.response?.data || error.message);
      alert('Failed to create post.');
    }
  };

  return (
    <div>
      <nav className="top-nav">
        <Link to="/">⬅️ NewsFeed</Link>
      </nav>

      <div className="create-post-container">
        <h2>Create Post</h2>
        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          <button type="submit">Post</button>
        </form>

        {previewURL && (
          <div className="preview">
            <h3>Preview</h3>
            <p>{content}</p>
            <img src={previewURL} alt="Preview" />
            <small>{new Date().toLocaleString()}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
