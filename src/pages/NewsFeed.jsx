import React, { useEffect, useState } from 'react';
import Post from '../components/Post/Post';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewsFeed = ({ onLogOut }) => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 1;
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNo) => {
    try {
      setLoading(true);
      const res = await axios.get(`${Base_Url}/api/posts?page=${pageNo}&limit=${pageSize}`);
      const newPosts = res.data.posts;

      if (Array.isArray(newPosts) && newPosts.length > 0) {
        setPosts((prev) => {
          const ids = new Set(prev.map((post) => post.id));
          const filtered = newPosts.filter((post) => !ids.has(post.id));
          return [...prev, ...filtered];
        });

        // Only increment page if more posts were fetched
        if (newPosts.length < pageSize) {
          setHasMore(false); // No more data if fewer than pageSize
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when page changes
  useEffect(() => {
    if (hasMore) {
      fetchPosts(page);
    }
  }, [page]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50; // small buffer

      if (nearBottom && hasMore && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  const handleClick = (post) => {
    navigate(`/post/${post.id}`, {
      state: { ...post }
    });
  };

  return (
    <div>
      <h1 className='news' style={{ marginTop:'50px', textAlign: 'center' }}>My News Feed</h1>

      {posts.length === 0 && !loading && (
        <p style={{ textAlign: 'center' }}>No posts found.</p>
      )}

      {posts.map((post) => (
        <Post
          key={post.id}
          postId={post.id}
          content={post.content}
          likes={post.Likes?.length || 0}
          comments={post.Comments || []}
          username={post.User?.name || 'Anonymous'}
          image={post.image}
          profile={
            post.User?.profileImage ||
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyCixyM2urliFC1w0DyNMJpBRMOXFizr3FR8aRIFfcDUGBzEaXcV6mt4gVWRqGAqqu4PI&usqp=CAU'
          }
          onClick={() => handleClick(post)}
        />
      ))}

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {!loading && !hasMore && (
        <p style={{ textAlign: 'center', marginBottom:'100px' }}>No more posts to show.</p>
      )}
    </div>
  );
};

export default NewsFeed;
