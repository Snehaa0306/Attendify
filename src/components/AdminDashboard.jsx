import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import AdminDashboardContent from "./AdminDashboardContent";
import AdminAssignContent from "./AdminAssignContent";
import AdminFacultyContent from "./AdminFacultyContent";
import AdminClassesContent from "./AdminClassesContent";
import AdminReportsContent from "./AdminReportsContent";
import AdminAttendanceContent from "./AdminAttendanceContent";
import AdminDefaulterContent from "./AdminDefaulterContent";
import attendifyLogo from "../assets/attendify.png";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="admin-page">
      <div className="sidebar">
        <img src={attendifyLogo} alt="Attendify Logo" className="logo" />

        <button
          className="btn-dashboard"
          onClick={() => setActiveSection("Dashboard")}
        >
          Dashboard
        </button>

        <button
          className="btn-faculty"
          onClick={() => setActiveSection("Faculty")}
        >
          Faculty
        </button>

        <button
          className="btn-classes"
          onClick={() => setActiveSection("Classes")}
        >
          Classes
        </button>

        <button
          className="btn-assign"
          onClick={() => setActiveSection("Assign")}
        >
          Assign
        </button>

        <button
          className="btn-attendance"
          onClick={() => setActiveSection("Attendance")}
        >
          Attendance
        </button>

        <button
          className="btn-defaulter"
          onClick={() => setActiveSection("Defaulter")}
        >
          Defaulter
        </button>

        <button
          className="btn-reports"
          onClick={() => setActiveSection("Reports")}
        >
          Attendance Justification
        </button>

        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        {activeSection === "Dashboard" && (
          <AdminDashboardContent setActiveSection={setActiveSection} />
        )}

        {activeSection === "Faculty" && <AdminFacultyContent />}

        {activeSection === "Classes" && <AdminClassesContent />}

        {activeSection === "Assign" && <AdminAssignContent />}

        {activeSection === "Attendance" && <AdminAttendanceContent />}

        {activeSection === "Defaulter" && <AdminDefaulterContent />}

        {activeSection === "Reports" && <AdminReportsContent />}
      </div>
    </div>
  );
};

export default AdminDashboard;