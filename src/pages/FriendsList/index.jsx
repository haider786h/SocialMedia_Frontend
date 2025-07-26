import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './FriendList.css';

const FriendsPage = () => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const [friends, setFriends] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`${Base_Url}/api/friends/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFriends(res.data.friends); // assuming backend returns { friends: [...] }
      } catch (err) {
        console.error('Failed to fetch friends:', err.message);
      }
    };

    fetchFriends();
  }, []);

  const handleRemove = async (friendId) => {
    try {
      await axios.delete(`${Base_Url}/api/friends/unfriend/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    } catch (err) {
      console.error('Failed to remove friend:', err.message);
      alert(err?.response?.data?.message || 'Could not unfriend.');
    }
  };

  const defaultImage =
    'https://static.vecteezy.com/system/resources/previews/001/840/612/non_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg';

  return (
    <div>
      <nav className="Top-nav">
        <Link to="/">⬅️ NewsFeed</Link>
      </nav>

      <div className="friend-Request-container">
        <h2>Your Friends</h2>

        {friends.length === 0 ? (
          <p>You have no friends yet.</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="friend-Request-card">
              <img
                src={friend.profileImage || defaultImage}
                alt={friend.name}
                className="friend-Pic"
              />
              <div className="friend-Info">
                <h4>{friend.name}</h4>
                <button className="Remove-Btn" onClick={() => handleRemove(friend.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
