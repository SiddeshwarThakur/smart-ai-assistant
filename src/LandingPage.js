import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="overlay" />
      <div className="landing-content">
        <h1 className="landing-title">Zephyrus</h1>
        <p className="landing-tagline">The Wind Beneath Your Wings to Success.</p>
        <div className="landing-buttons">
          <button className="landing-btn primary" onClick={() => navigate("/sign-in")}>
            Sign In
          </button>
          <button className="landing-btn secondary" onClick={() => navigate("/sign-up")}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
