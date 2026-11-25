import React, { useEffect, useState } from "react";
import "./AdminDashboardContent.css";

import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const AdminDashboardContent = ({ setActiveSection }) => {

  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        /* ================= STUDENTS ================= */

        let totalStudents = 0;

        const yearsSnapshot = await getDocs(collection(db, "academicYears"));

        for (const yearDoc of yearsSnapshot.docs) {

          const classesSnapshot = await getDocs(
            collection(db, "academicYears", yearDoc.id, "classes")
          );

          for (const classDoc of classesSnapshot.docs) {

            const studentsSnapshot = await getDocs(
              collection(
                db,
                "academicYears",
                yearDoc.id,
                "classes",
                classDoc.id,
                "students"
              )
            );

            totalStudents += studentsSnapshot.size;

          }

        }

        setStudentCount(totalStudents);

        /* ================= FACULTY ================= */

        const facultyQuery = query(
          collection(db, "users"),
          where("role", "==", "Lecturer")
        );

        const facultySnapshot = await getDocs(facultyQuery);

        setFacultyCount(facultySnapshot.size);

        /* ================= CLASSES ================= */

        let totalClasses = 0;

        for (const yearDoc of yearsSnapshot.docs) {

          const classesSnapshot = await getDocs(
            collection(db, "academicYears", yearDoc.id, "classes")
          );

          totalClasses += classesSnapshot.size;

        }

        setClassCount(totalClasses);

        /* ================= ATTENDANCE RATE ================= */

        const attendanceSnapshot = await getDocs(
          collection(db, "attendance")
        );

        let totalAttendance = 0;
        let presentCount = 0;

        attendanceSnapshot.docs.forEach((doc) => {

          const data = doc.data();

          data.students.forEach((s) => {

            totalAttendance++;

            if (s.status === "Present") {
              presentCount++;
            }

          });

        });

        const rate =
          totalAttendance === 0
            ? 0
            : Math.round((presentCount / totalAttendance) * 100);

        setAttendanceRate(rate);

      } catch (error) {

        console.error("Dashboard error:", error);

      }

    };

    fetchDashboardData();

  }, []);

  return (

    <div className="dashboard-container">

      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Overview of students, faculty and assignments</p>
      </div>

      <div className="dashboard-section-scroll">

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h3>Total Students</h3>
            <p>{studentCount}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Faculty</h3>
            <p>{facultyCount}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Classes</h3>
            <p>{classCount}</p>
          </div>

          <div className="dashboard-card">
            <h3>Attendance Rate</h3>
            <p>{attendanceRate}%</p>
          </div>

        </div>

        <div className="dashboard-info-card">

          <h3 className="dashboard-card-title">Quick Actions</h3>

          <div className="quick-actions">

            <button
              className="quick-btn"
              onClick={() => setActiveSection("Classes")}
            >
              Add New Student
            </button>

            <button
              className="quick-btn"
              onClick={() => setActiveSection("Faculty")}
            >
              Add New Faculty
            </button>

            <button
              className="quick-btn"
              onClick={() => setActiveSection("Classes")}
            >
              Create New Class
            </button>

            <button
              className="quick-btn"
              onClick={() => setActiveSection("Reports")}
            >
              Attendance Justification
            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default AdminDashboardContent;