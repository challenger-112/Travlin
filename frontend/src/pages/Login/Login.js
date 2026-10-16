import React, { useState } from 'react';
import logo from '../../assets/images/logo.png';
import { useNavigate } from "react-router-dom";
import API from '../../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username) {
      alert("Please enter username or email");
      return;
    }

    if (!password) {
      alert("Please enter password");
      return;
    }

    try {
      const { data } = await API.post("login/", {
        username,
        password,
      });

        alert("Login Successful");

        localStorage.setItem("username", data.user.username);
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        window.location.assign("/");
        window.dispatchEvent(new Event("auth-session-updated"));
        window.dispatchEvent(new Event("auth-token-updated"));

        // navigate("/");
    } catch (error) {
        console.error("Login error:", error);
        alert(
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Unable to connect to server"
        );
    }
  };

  return (
    <div className="slider-container">
        <div className="modal-overlay">
            <div className="modal-layout">
                {/* Left Side */}
                <div className="modal-left">
                <img src={logo} alt="Logo" className="modal-logo" />
                <h1 className="modal-title">Travलिन</h1>
                <p>Your personalized travel companion</p>
                <p>Plan your next adventure with us !!!!</p>
                </div>

                {/* Right Side */}
                <div className="modal-right">
                <button className="modal-close" onClick={() => navigate("/")}>×</button>

                <div className="modal-section">
                  <h2>Login</h2>
                  <h4>Get access to more features</h4>
                  <input type="text" placeholder="Email | Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button onClick={handleLogin}>Login</button>
                  <p className="switch-text">Don't have an account?{' '}
                      <span onClick={() => navigate("/signup")} className="link-class">Signup here</span>
                  </p>
                </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Login;