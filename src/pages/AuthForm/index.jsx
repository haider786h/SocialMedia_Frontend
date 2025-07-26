import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';

const AuthForm = ({ onLogin }) => {
  const Base_Url = import.meta.env.VITE_BASE_URL;
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData(prev => ({
      name: '',
      email: prev.email,
      password: prev.password
    }));
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? `${Base_Url}/api/users/login`
      : `${Base_Url}/api/users/register`;

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await axios.post(url, payload, {
        withCredentials: true
      });

      const data = res.data;
      const user = data.user;

      if (isLogin) {
        alert('Login Successfully');
        localStorage.setItem("token", data.token);
        localStorage.setItem('username', user.name);
        localStorage.setItem('userId', user.id);
        localStorage.setItem("profileImage", user.profileImage || "");
        console.log("Profile Image URL:", user.profileImage);
        onLogin(data.token);
        setFormData({ name: '', email: '', password: '' }); // Clear only after login
      } else {
        alert("Sign up successful, Please Login");
        setIsLogin(true); // Switch to login
        // Don't reset form here — keep email & password filled for login
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Something went wrong!';
      alert(message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p className="toggle-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <span onClick={toggleForm}>{isLogin ? ' Sign Up' : ' Login'}</span>
      </p>
    </div>
  );
};

export default AuthForm;
