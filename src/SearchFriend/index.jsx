import React, { useState } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import { UserCheck, Clock, UserPlus } from 'lucide-react';
import './SearchFriend.css';

const SearchFriend = () => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const token = localStorage.getItem('token');
  // console.log('Sending token:', token);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length < 3) {
      setResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `${Base_Url}/api/friends/search?query=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data || [];

      const fuse = new Fuse(data, {
        keys: ['name'],
        threshold: 0.9,
      });

      const filtered = fuse.search(value).map((result) => result.item);
      setResults(filtered);
    } catch (err) {
      // console.error('Search failed:', err.message);
    }
  };



  const handleSendRequest = async (receiverId) => {
    try {
      await axios.post(
        `${Base_Url}/api/friends/send`,
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults((prevResults) =>
        prevResults.map((user) =>
          user.id === receiverId ? { ...user, status: 'request_sent' } : user
        )
      );
    } catch (err) {
      console.error('Failed to send friend request:', err.message);
      alert(err?.response?.data?.message || 'Request failed');
    }
  };


  const defaultImage =
  'https://static.vecteezy.com/system/resources/previews/001/840/612/non_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg';

  return (
    <div className="search-friend-container">
      <h2 className="search-heading">🔍 Find Friends</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Start typing a name..."
          value={searchTerm}
          onChange={handleInputChange}
          className="search-input"
        />
      </div>

      <ul className="search-results">
        {results.length === 0 && searchTerm && (
          <p className="no-results">No users found.</p>
        )}
        {results.map((user) => (
          <li key={user.id} className="user-item">
            <div className="user-info">
              <img
                src={user.profileImage || defaultImage }
                alt=""
                className="profile-avatar"
              />
              <span className="user-name">{user.name}</span>
            </div>
            {user.status === 'friends' ? (
              <button className="request-button friends" disabled>
                <UserCheck size={16} className="icon" /> Connected
              </button>
            ) : user.status === 'request_sent' ? (
              <button className="request-button sent" disabled>
                <Clock size={16} className="icon" /> Pending
              </button>
            ) : (
              <button
                onClick={() => handleSendRequest(user.id)}
                className="request-button"
              >
                <UserPlus size={16} className="icon" /> Add Friend
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchFriend;
