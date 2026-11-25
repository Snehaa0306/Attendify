import React, { useEffect, useState } from "react";
import "./LecturerDashboardContent.css";

import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const LecturerDashboardContent = ({ setActiveSection }) => {

  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [myClasses, setMyClasses] = useState(0);
  const [myStudents, setMyStudents] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {

    const fetchDashboardData = async () => {

      if (!currentUser?.email) return;

      try {

        const lecturerEmail = currentUser.email.trim().toLowerCase();

        /* ================= MY CLASSES ================= */

        const assignmentQuery = query(
          collection(db, "assignments"),
          where("lecturerEmail", "==", lecturerEmail)
        );

        const assignmentSnapshot = await getDocs(assignmentQuery);

        const assignments = assignmentSnapshot.docs.map((doc) => doc.data());

        setMyClasses(assignments.length);

        /* ================= STUDENT COUNT ================= */

        let totalStudents = 0;

        for (const a of assignments) {

          const studentsRef = collection(
            db,
            "academicYears",
            a.year,
            "classes",
            a.class,
            "students"
          );

          const studentsSnapshot = await getDocs(studentsRef);

          totalStudents += studentsSnapshot.size;

        }

        setMyStudents(totalStudents);

        /* ================= ATTENDANCE RATE ================= */

        const attendanceQuery = query(
          collection(db, "attendance"),
          where("lecturer", "==", lecturerEmail)
        );

        const attendanceSnapshot = await getDocs(attendanceQuery);

        let totalAttendance = 0;
        let presentCount = 0;

        attendanceSnapshot.docs.forEach((doc) => {

          const data = doc.data();

          if (data.students) {

            data.students.forEach((s) => {

              totalAttendance++;

              if (s.status === "Present") presentCount++;

            });

          }

        });

        const rate =
          totalAttendance === 0
            ? 0
            : Math.round((presentCount / totalAttendance) * 100);

        setAttendanceRate(rate);

        /* ================= RECENT ACTIVITY ================= */

        const recentQuery = query(
          collection(db, "attendance"),
          where("lecturer", "==", lecturerEmail)
        );

        const recentSnapshot = await getDocs(recentQuery);

        const recentData = recentSnapshot.docs.map((doc) => doc.data());

        recentData.sort((a, b) => new Date(b.date) - new Date(a.date));

        setRecentActivities(recentData.slice(0, 4));

      } catch (error) {

        console.error("Lecturer dashboard error:", error);

      }

    };

    fetchDashboardData();

  }, [currentUser]);

  return (

    <div className="lecturer-dashboard-container">

      {/* HEADER */}

      <div className="lecturer-dashboard-header">

        <h2>Lecturer Dashboard</h2>

        <p>Overview of your classes and attendance</p>

      </div>

      <div className="lecturer-dashboard-scroll">

        {/* DASHBOARD CARDS */}

        <div className="lecturer-dashboard-cards">

          <div className="lecturer-dashboard-card">
            <h3>My Classes</h3>
            <p>{myClasses}</p>
          </div>

          <div className="lecturer-dashboard-card">
            <h3>Total Students</h3>
            <p>{myStudents}</p>
          </div>

          <div className="lecturer-dashboard-card">
            <h3>Attendance Rate</h3>
            <p>{attendanceRate}%</p>
          </div>

        </div>

        {/* BOTTOM SECTION */}

        <div className="dashboard-bottom-row">

          {/* QUICK ACTIONS */}

          <div className="lecturer-dashboard-info">

            <h3 className="lecturer-dashboard-title">Quick Actions</h3>

            <div className="lecturer-quick-actions">

              <button
                className="lecturer-quick-btn"
                onClick={() => setActiveSection("MyClasses")}
              >
                View Class
              </button>

              <button
                className="lecturer-quick-btn"
                onClick={() => setActiveSection("Attendance")}
              >
                Take Attendance
              </button>

              <button
                className="lecturer-quick-btn"
                onClick={() => setActiveSection("MyClasses")}
              >
                View Students
              </button>
            </div>

          </div>

          {/* RECENT ACTIVITY */}

          <div className="recent-activity-card">

            <h3 className="lecturer-dashboard-title">Recent Activity</h3>

            <ul className="activity-list">

              {recentActivities.length === 0 ? (

                <li>No recent attendance marked.</li>

              ) : (

                recentActivities.map((activity, index) => (

                  <li key={index}>
                     Attendance marked for {activity.year} • {activity.class} ({activity.subject})
                  </li>

                ))

              )}

            </ul>

          </div>

        </div>

      </div>

    </div>

  );

};

export default LecturerDashboardContent;