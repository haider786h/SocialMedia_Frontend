import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NewsFeed from './pages/NewsFeed';
import PostDetails from './pages/PostDetail';
import Footer from './components/Footer';
import FriendRequests from './pages/FriendReq';
import Chat from './pages/Chat';
import FriendsList from './pages/FriendsList';
import CreatePost from './pages/CreatePost';
import UploadProfile from './pages/UploadProfile';
import { useEffect, useState } from 'react';
import AuthForm from './pages/AuthForm';
import SearchFriend from './SearchFriend';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); // Set initial state based on token
      // Trigger profile fetch in Header when token exists
    } else {
      setIsLoggedIn(false);
      localStorage.clear(); // Clear stale data on no token
    }
  }, []);

  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} /> {/* Always render Header */}
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <NewsFeed onLogOut={() => setIsLoggedIn(false)} />
            ) : (
              <AuthForm onLogin={() => setIsLoggedIn(true)} />
            )
          }
        />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/friendreq" element={<FriendRequests />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/post" element={<CreatePost />} />
        <Route path="/upload-profile" element={<UploadProfile />} />
        <Route path="/search-user" element={<SearchFriend />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;