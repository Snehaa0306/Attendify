import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LecturerClassesContent.css";

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const LecturerClassesContent = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [myAssignments, setMyAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});

  /* ================= LOAD LECTURER ASSIGNMENTS ================= */

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser || !currentUser.email) {
        console.warn("No lecturer logged in. currentUser is missing.");
        setMyAssignments([]);
        return;
      }

      try {
        const lecturerEmail = currentUser.email.trim().toLowerCase();

        const snapshot = await getDocs(collection(db, "assignments"));

        const allAssignments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = allAssignments.filter(
          (a) => a.lecturerEmail?.trim().toLowerCase() === lecturerEmail
        );

        setMyAssignments(filtered);
      } catch (error) {
        console.error("Assignment fetch error:", error);
      }
    };

    fetchAssignments();
  }, [currentUser]);

  /* ================= LOAD STUDENT COUNTS ================= */

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};

      for (const a of myAssignments) {
        try {
          const studentsRef = collection(
            db,
            "academicYears",
            a.year,
            "classes",
            a.class,
            "students"
          );

          const snapshot = await getDocs(studentsRef);

          counts[`${a.year}_${a.class}`] = snapshot.size;
        } catch (err) {
          console.error("Count fetch error:", err);
        }
      }

      setStudentCounts(counts);
    };

    if (myAssignments.length > 0) {
      fetchCounts();
    }
  }, [myAssignments]);

  /* ================= LOAD STUDENTS FROM FIRESTORE ================= */

  useEffect(() => {
    if (selectedAssignment) {
      const fetchStudents = async () => {
        try {
          const studentsRef = collection(
            db,
            "academicYears",
            selectedAssignment.year,
            "classes",
            selectedAssignment.class,
            "students"
          );

          const q = query(studentsRef, orderBy("rollNumber", "asc"));

          const snapshot = await getDocs(q);

          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setStudentsList(data);
        } catch (error) {
          console.error("Fetch students error:", error);
        }
      };

      fetchStudents();
    }
  }, [selectedAssignment]);

  /* ================= IF LECTURER NOT LOGGED IN ================= */

  if (!currentUser) {
    return (
      <div className="classes-container">
        <div className="classes-header">
          <h2>My Classes</h2>
          <p style={{ color: "red" }}>
            Lecturer not logged in. Please login again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="classes-container">
      {/* HEADER */}

      <div className="classes-header">
        <h2>My Classes</h2>
        <p>Manage and Track your assigned classes</p>
      </div>

      {/* ASSIGNED CLASSES */}

      {!selectedAssignment && (
        <div className="classes-white-card">
          <div className="assigned-section">
            <h2>Assigned Classes ({myAssignments.length})</h2>
          </div>

          {myAssignments.length === 0 ? (
            <p
              style={{ textAlign: "center", marginTop: "20px", color: "gray" }}
            >
              No classes assigned to you yet.
            </p>
          ) : (
            <div className="assigned-classes-grid">
              {myAssignments.map((a, index) => {
                const countKey = `${a.year}_${a.class}`;
                const totalStudents = studentCounts[countKey] || 0;

                return (
                  <div
                    key={index}
                    className="lecturer-card"
                    onClick={() => setSelectedAssignment(a)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Header */}

                    <div className="lecturer-card-header">
                      <div>
                        <h4>{a.subject}</h4>
                        <small>
                          {a.year} • {a.class}
                        </small>
                      </div>

                      <div className="student-badge">👥 {totalStudents}</div>
                    </div>

                    {/* Attendance Button */}

                    <div className="attendance-row">
                      <button className="mark-btn" disabled>
                        📅 Mark Attendance
                      </button>
                    </div>

                    {/* Footer */}

                    <div className="lecturer-card-body">
                      <div className="card-footer">
                        <span className="active">⭐ Active Class</span>
                        <span className="ready">✔ Ready for Attendance</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STUDENT TABLE */}

      {selectedAssignment && (
        <>
          <div className="header-row">
            <h2>
              {selectedAssignment.year} → {selectedAssignment.class}
            </h2>

            <button
              className="back-btn"
              onClick={() => {
                setSelectedAssignment(null);
                setStudentsList([]);
              }}
            >
              ← Back
            </button>
          </div>

          <p>
            Subject: <b>{selectedAssignment.subject}</b>
          </p>

          {studentsList.length > 0 ? (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>

              <tbody>
                {studentsList.map((s, index) => (
                  <tr key={index}>
                    <td>{s.roll}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students found for this class.</p>
          )}
        </>
      )}
    </div>
  );
};

export default LecturerClassesContent;
