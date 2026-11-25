import React from "react";
import { useNavigate } from "react-router-dom"; // for navigation
import "./MainPage.css";
import bgImage from "../assets/bg.png";
import logo from "../assets/logo.png";

const MainPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/signin"); // navigate to SignIn page
  };

  return (
    <div
      className="main-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="college-header">
        {/* College Name */}
        <p className="college-name">S.P. MANDALI'S</p>
        <p className="college-fullname">
          RAMNARAIN RUIA AUTONOMOUS COLLEGE
        </p>
        <p className="college-location">MATUNGA, MUMBAI</p>

        {/* Department */}
        <h1 className="department-name">
          DEPARTMENT OF COMPUTER SCIENCE & IT
        </h1>

        {/* College Logo */}
        <img src={logo} alt="College Logo" className="college-logo" />

        {/* Buttons */}
        <div className="college-buttons">
          <button className="college-btn" onClick={handleSignIn}>
            SignIn
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
