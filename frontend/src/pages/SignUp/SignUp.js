import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.png';
import { useNavigate } from "react-router-dom";
import './SignUp.css';

function SignUp() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {

    if (!username || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    const response = await fetch(
        // "http://127.0.0.1:8000/api/signup/",
        "http://192.168.1.54:8000/api/signup/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (response.ok) {
        alert("Signup Successful");
        navigate("/login");
    } else {
        alert(data.message || "Signup Failed");
    }

  };

  return (
    <div className="slider-container signup-page">
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
                <h2>Signup</h2>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleSignup}>Signup</button>
                <p className="switch-text">Already have an account?{' '}
                    <span onClick={() => navigate('/login')} className="link-class">Login here</span>
                </p>
                </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default SignUp;