import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = () => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const [friends, setFriends] = useState([]);
  const [friendPage, setFriendPage] = useState(1);
  const [hasMoreFriends, setHasMoreFriends] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isScrollingToBottomRef = useRef(false);
  const initialScrollSetRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const sidebarOpen = useRef(false);
  const loadingRef = useRef(false);
  const scrollAnimationFrameRef = useRef(null);
  const friendListRef = useRef(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`${Base_Url}/api/friends/list?page=${friendPage}&limit=9`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formatted = res.data.friends.map((f) => ({
          id: f.id,
          name: f.name,
          profileImage: f.profileImage || null, 
          status: 'online',
        }));

        setFriends((prev) => {
          const existingIds = new Set(prev.map((f) => f.id));
          const newUnique = formatted.filter((f) => !existingIds.has(f.id));
          return [...prev, ...newUnique];
        });

        if (formatted.length < 20) setHasMoreFriends(false);
      } catch (err) {
        console.error('Failed to fetch friends:', err.message);
      }
    };

    fetchFriends();
  }, [friendPage, token]);


  // useEffect(() => {
  //   fetchFriends();
  // }, []);

  const handleFriendScroll = () => {
    const list = friendListRef.current;
    if (!list || !hasMoreFriends) return;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) {
      const nextPage = friendPage + 1;
      setFriendPage(nextPage);
      fetchFriends(nextPage);
    }
  };

  useEffect(() => {
    const list = friendListRef.current;
    if (!list) return;

    const handleScroll = () => {
      if (!hasMoreFriends) return;
      if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) {
        setFriendPage((prev) => prev + 1);
      }
    };

    list.addEventListener('scroll', handleScroll);
    return () => list.removeEventListener('scroll', handleScroll);
  }, [hasMoreFriends]);

  const smoothScrollToBottom = useCallback(() => {
    if (!messagesEndRef.current || isScrollingToBottomRef.current) return;
    isScrollingToBottomRef.current = true;
    const element = messagesEndRef.current;
    const start = chatBoxRef.current.scrollTop;
    const target = element.offsetTop - chatBoxRef.current.offsetHeight + 50;
    const duration = 300;
    const startTime = performance.now();
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutQuad(progress);
      chatBoxRef.current.scrollTop = start + (target - start) * easeProgress;
      if (progress < 1) {
        scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll);
      } else {
        isScrollingToBottomRef.current = false;
        if (chatBoxRef.current) {
          lastScrollTopRef.current = chatBoxRef.current.scrollTop;
          initialScrollSetRef.current = true;
        }
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
    scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll);
    return () => cancelAnimationFrame(scrollAnimationFrameRef.current);
  }, []);

  const easeOutQuad = (t) => t * (2 - t);

  const isNearBottom = useCallback(() => {
    if (!chatBoxRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  const preserveScrollPosition = useCallback(() => {
    if (chatBoxRef.current) {
      const { scrollTop, scrollHeight } = chatBoxRef.current;
      scrollPositionRef.current = scrollHeight - scrollTop;
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (chatBoxRef.current) {
      const { scrollHeight } = chatBoxRef.current;
      const targetScrollTop = scrollHeight - scrollPositionRef.current;
      const start = chatBoxRef.current.scrollTop;
      const duration = 0;
      const startTime = performance.now();
      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeOutQuad(progress);
        chatBoxRef.current.scrollTop = start + (targetScrollTop - start) * easeProgress;
        if (progress < 1) requestAnimationFrame(animateScroll);
        else lastScrollTopRef.current = targetScrollTop;
      };
      requestAnimationFrame(animateScroll);
    }
  }, []);

  const fetchMessages = useCallback(async (friendId, pageNum = 1, isPrepend = false) => {
    if (loadingRef.current || (!hasMore && isPrepend)) return;
    loadingRef.current = true;
    setIsLoadingMessages(true);
    if (isPrepend) preserveScrollPosition();
    try {
      const res = await axios.get(`${Base_Url}/api/messages/${friendId}?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const messages = res.data;
      const formatted = messages.map((msg) => ({
        id: msg.id || `${msg.senderId}-${msg.createdAt}`,
        sender: String(msg.senderId) === String(userId) ? 'you' : 'friend',
        text: msg.content,
        senderId: msg.senderId,
        timestamp: msg.updatedAt || msg.createdAt || new Date().toISOString(),
      })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setHasMore(messages.length === 20);
      setChatHistory((prev) => {
        const existing = prev[friendId] || [];
        if (isPrepend) {
          const newOnes = formatted.filter((m) => !existing.some((e) => e.id === m.id));
          return { ...prev, [friendId]: [...newOnes, ...existing] };
        } else {
          return { ...prev, [friendId]: [...formatted] };
        }
      });
      if (isPrepend) setTimeout(() => restoreScrollPosition(), 10);
      else setTimeout(() => { smoothScrollToBottom(); setIsInitialLoad(false); }, 10);
    } catch (err) {
      console.error('Failed to fetch messages:', err.message);
    } finally {
      setIsLoadingMessages(false);
      loadingRef.current = false;
    }
  }, [token, userId, hasMore, preserveScrollPosition, restoreScrollPosition, smoothScrollToBottom]);

  const handleFriendClick = useCallback((friend) => {
    if (selectedFriend?.id === friend.id) return;
    setSelectedFriend(friend);
    setPage(1);
    setHasMore(true);
    setIsInitialLoad(true);
    setChatHistory((prev) => ({ ...prev, [friend.id]: [] }));
    fetchMessages(friend.id, 1);
    sidebarOpen.current = false;
  }, [selectedFriend, fetchMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedFriend) return;
    const messageText = input.trim();
    const tempId = `temp-${Date.now()}`;
    const wasNearBottom = isNearBottom();
    const newMessage = {
      id: tempId,
      sender: 'you',
      text: messageText,
      senderId: userId,
      timestamp: new Date().toISOString(),
      sending: true,
    };
    setChatHistory((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMessage],
    }));
    setInput('');
    if (wasNearBottom) setTimeout(smoothScrollToBottom, 30);
    try {
      const response = await axios.post(`${Base_Url}/api/messages/send`, {
        receiverId: selectedFriend.id,
        content: messageText,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setChatHistory((prev) => ({
        ...prev,
        [selectedFriend.id]: prev[selectedFriend.id].map((m) =>
          m.id === tempId ? { ...m, id: response.data.id || tempId, sending: false, timestamp: response.data.updatedAt || response.data.createdAt || new Date().toISOString() } : m
        ),
      }));
    } catch (err) {
      console.error('Failed to send message:', err.message);
    }
  };

  const handleScroll = useCallback(() => {
    if (!chatBoxRef.current || !hasMore || !selectedFriend || loadingRef.current) return;
    const { scrollTop } = chatBoxRef.current;
    if (!initialScrollSetRef.current) return;
    if (scrollTop < 100 && scrollTop < lastScrollTopRef.current) {
      setPage((prev) => {
        const next = prev + 1;
        fetchMessages(selectedFriend.id, next, true);
        return next;
      });
    }
    lastScrollTopRef.current = scrollTop;
  }, [selectedFriend, hasMore, fetchMessages]);

  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (chatBox) chatBox.addEventListener('scroll', handleScroll, { passive: true });
    return () => chatBox?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  const getInitials = useCallback((name) => name ? name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase() : '??', []);

  const groupedMessages = useMemo(() => {
    const currentMessages = selectedFriend ? chatHistory[selectedFriend.id] || [] : [];
    const groups = [];
    let current = [];
    let lastSender = null;
    currentMessages.forEach((msg) => {
      if (msg.sender !== lastSender) {
        if (current.length) groups.push(current);
        current = [msg];
        lastSender = msg.sender;
      } else {
        current.push(msg);
      }
    });
    if (current.length) groups.push(current);
    return groups;
  }, [selectedFriend, chatHistory]);

  const toggleSidebar = () => {
    sidebarOpen.current = !sidebarOpen.current;
    document.querySelector('.chat-sidebar')?.classList.toggle('open');
  };

  return (
    <div className="chat-container">
      <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
      <div className="chat-sidebar">
        <h3>Messages</h3>
        <div className="friend-list" ref={friendListRef}>
          {friends.map((friend) => (
            <div
              key={friend.id}
              className={`friend-item ${selectedFriend?.id === friend.id ? 'active' : ''}`}
              onClick={() => handleFriendClick(friend)}
            >
              {friend.profileImage ? (
                <img src={friend.profileImage} alt="avatar" className="friend-avatar-img" />
              ) : (
                <div className="friend-avatar">{getInitials(friend.name)}</div>
              )}

              <div className="friend-info">
                <div className="friend-name">{friend.name}</div>
                <div className="friend-status">{friend.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              <button className="back-button" onClick={() => setSelectedFriend(null)}>←</button>
              {selectedFriend.profileImage ? (
                <img src={selectedFriend.profileImage} alt="avatar" className="chat-header-avatar-img" />
              ) : (
                <div className="chat-header-avatar">{getInitials(selectedFriend.name)}</div>
              )}

              <div className="chat-header-info">
                <h4>{selectedFriend.name}</h4>
                <p>last seen recently</p>
              </div>
            </div>
            <div className="chat-messages" ref={chatBoxRef}>
              {isLoadingMessages && <div className="loading">Loading messages...</div>}
              {!hasMore && groupedMessages.length > 0 && <div className="no-more-messages">No more conversation</div>}
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className={`message-group ${group[0].sender === 'you' ? 'own' : 'other'}`}>
                  {group.map((msg, msgIndex) => (
                    <div key={msg.id || msgIndex} className={`chat-bubble ${msg.sender} ${msg.sending ? 'sending' : ''}`} style={{ animationDelay: `${msgIndex * 0.05}s` }}>{msg.text}</div>
                  ))}
                  <div className={`message-time ${group[0].sender === 'you' ? 'own' : 'other'}`}>{formatTime(group[group.length - 1].timestamp)}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input" onSubmit={handleSend}>
              <input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
              <button type="submit" className="send-button" disabled={!input.trim()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <h3>Select a friend to start chatting</h3>
            <p>Choose a conversation from the sidebar</p>
          </div>
        )}
      </div>
    </div>

  );
};

export default Chat;
