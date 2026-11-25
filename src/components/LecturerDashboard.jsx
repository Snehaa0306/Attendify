import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LecturerDashboard.css";
import attendifyLogo from "../assets/attendify.png";

import LecturerDashboardContent from "./LecturerDashboardContent";
import LecturerAttendanceContent from "./LecturerAttendanceContent";
import LecturerClassesContent from "./LecturerClassesContent";
import LecturerReportsContent from "./LecturerReportsContent";

const LecturerDashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/signin");
  };

  return (
    <div className="lecturer-page">
      {/* Sidebar */}
      <div className="sidebar">
        <img src={attendifyLogo} alt="Attendify Logo" className="logo" />

        <button
          className="btn-dashboard"
          onClick={() => setActiveSection("Dashboard")}
        >
          Dashboard
        </button>

        <button
          className="btn-classes"
          onClick={() => setActiveSection("MyClasses")}
        >
          My Classes
        </button>

        <button
          className="btn-attendance"
          onClick={() => setActiveSection("Attendance")}
        >
          Attendance
        </button>

        <button
          className="btn-reports"
          onClick={() => setActiveSection("Reports")}
        >
          Reports
        </button>

        {/* Logout */}
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === "Dashboard" && (
          <LecturerDashboardContent setActiveSection={setActiveSection} />
        )}

        {activeSection === "MyClasses" && <LecturerClassesContent />}

        {activeSection === "Attendance" && <LecturerAttendanceContent />}

        {activeSection === "Reports" && <LecturerReportsContent />}
      </div>
    </div>
  );
};

export default LecturerDashboard;
