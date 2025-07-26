import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import Post from '../components/Post/Post';

const PostDetail = () => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const location = useLocation();
  const { id } = useParams();
  const [post, setPost] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If post not passed via state, fetch from backend
    if (!post) {
      const fetchPost = async () => {
        try {
          const res = await axios.get(`${Base_Url}/api/posts/${id}`);
          setPost(res.data);
        } catch (err) {
          console.error('Failed to fetch post by ID:', err);
          setError('Post not found or server error');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, post]);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading post...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
  if (!post) return null;

  return (
    <div>
      <Post
        postId={post.id}
        content={post.content}
        likes={post.Likes?.length || 0}
        comments={post.Comments || []}
        username={post.User?.name || 'Anonymous'}
        image={post.image}
        profile={post.User?.profileImage || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyCixyM2urliFC1w0DyNMJpBRMOXFizr3FR8aRIFfcDUGBzEaXcV6mt4gVWRqGAqqu4PI&usqp=CAU'}
        onClick={() => {}} // no click on detail view
      />
    </div>
  );
};

export default PostDetail;
