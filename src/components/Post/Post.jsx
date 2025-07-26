import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './post.css';

const Post = ({
  postId,
  username,
  content,
  likes: initialLikes = 0,
  comments: initialComments = [],
  image,
  profile,
  onClick,
}) => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const token = localStorage.getItem('token');

  const currentUser = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error("Invalid user data:", err);
      return null;
    }
  })();

  // Fetch likes and liked status
  useEffect(() => {
    if (!postId || !token) return;

    const fetchLikesAndStatus = async () => {
      try {
        const [likesRes, likedRes] = await Promise.all([
          axios.get(`${Base_Url}/api/likes/${postId}`),
          axios.get(`${Base_Url}/api/likes/check/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setLikes(likesRes.data.length);
        setLiked(likedRes.data.liked);
      } catch (err) {
        console.error(`Error fetching likes or like status:`, err.message);
      }
    };

    fetchLikesAndStatus();
  }, [postId, token]);


  // Like / Unlike
  const handleLike = async () => {
    if (!token) {
      alert("You must be logged in to like a post.");
      return;
    }

    try {
      const res = await axios.post(
        `${Base_Url}/api/likes/like`,
        { postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const message = res.data.message;
      if (message === 'Post liked') {
        setLiked(true);
        setLikes((prev) => prev + 1);
      } else if (message === 'Post unliked') {
        setLiked(false);
        setLikes((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err.message);
    }
  };


    // Fetch comments
    useEffect(() => {
      const fetchComments = async () => {
        try {
          const res = await axios.get(`${Base_Url}/api/comments/${postId}`);

          setComments(res.data);
        } catch (err) {
          console.error(`Error fetching comments:`, err.message);
        }
      };
      fetchComments();
    }, [postId]);

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    try {
      await axios.post(
        `${Base_Url}/api/comments`,
        { postId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Re-fetch full comment list with user info
      const res = await axios.get(`${Base_Url}/api/comments/${postId}`);
      setComments(res.data);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err.message);
    }
  };


  return (
    <div className="post-card">
      <div className="post-header">
        <img className="profile-pic" src={profile} alt="Profile" />
        <h3 className="username">@{username}</h3>
      </div>

      <div className="post-content">
        <p>{content}</p>
        {image && (
          <img className="post-img" src={image} alt="Post" onClick={onClick} />
        )}
      </div>

      <div className="post-actions">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <span className="heart">{liked ? '❤️' : '🤍'}</span> {liked ? 'Liked' : 'Like'}
        </button>

        <button className="comment-btn" onClick={() => setShowComments(!showComments)}>
          💬 Comment ({comments.length})
        </button>
      </div>

      <div className="post-stats">
        <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
        <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
      </div>

      {showComments && (
        <div className="comment-section">
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-submit-btn">Post</button>
          </form>

          <ul className="comment-list">
            {comments.map((c, idx) => (
              <li key={idx}>   
                <strong>{c.User?.name || 'User'}</strong>: {c.content}
              </li>
            ))}
          </ul>

        </div>
      )}
    </div>
  );
};

export default Post;
