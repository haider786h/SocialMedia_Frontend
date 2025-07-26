import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FriendReq.css';

const FriendRequests = () => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  const defaultImage =
    'https://static.vecteezy.com/system/resources/previews/001/840/612/non_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg';

  // Fetch friend requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${Base_Url}/api/friends/received`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err.message);
    }
  };

  // Handle Accept / Cancel
  const handleAction = async (requestId, action) => {
    try {
      if (action === 'accept') {
        await axios.post(
          `${Base_Url}/api/friends/accept/${requestId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const senderId = requests.find((r) => r.id === requestId)?.senderId;
        await axios.post(
          `${Base_Url}/api/friends/cancel`,
          { senderId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Remove the request from UI after action
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error('Action failed:', err.message);
      alert(err?.response?.data?.message || 'Request action failed');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <nav className="Top-Nav">
        <Link to="/">⬅️ NewsFeed</Link>
      </nav>

      <div className="friend-request-container">
        <h2>Friend Requests</h2>

        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          requests.map((request) => {
            const { id, sender } = request;
            const profileImage =
              sender?.profileImage?.trim() !== ''
                ? sender.profileImage
                : defaultImage;

            return (
              <div key={id} className="friend-request-card">
                <img
                  src={profileImage}
                  alt={sender?.name || 'User'}
                  className="friend-pic"
                />
                <div className="friend-info">
                  <h4>{sender?.name || 'Unknown User'}</h4>
                  <div className="friend-buttons">
                    <button
                      className="accept-btn"
                      onClick={() => handleAction(id, 'accept')}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-btn"
                      onClick={() => handleAction(id, 'cancel')}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
