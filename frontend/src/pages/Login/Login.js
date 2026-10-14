import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.png';
import { useNavigate } from "react-router-dom";
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
      const response = await fetch(
      // "http://127.0.0.1:8000/api/login/",
        "http://192.168.1.54:8000/api/login/",
        {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              username: username,
              password: password
          })
        }
    );

    const data = await response.json();

    if (response.ok) {
        alert("Login Successful");

        // If Django returns a JWT token
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        navigate("/");
    } else {
        alert(data.message || "Invalid username or password");
    }

    } catch (error) {
        console.error("Login error:", error);
        alert("Unable to connect to server");
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