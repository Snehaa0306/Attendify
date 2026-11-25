import React, { useEffect, useState } from "react";
import "./LecturerAttendanceContent.css";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const STATUS = ["Present", "Absent"];

const LecturerAttendanceContent = () => {
  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState("");
  const [myAssignments, setMyAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* CLOCK */

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* LOAD ONLY THIS LECTURER'S CLASSES FROM FIRESTORE */

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser?.email) return;

      try {
        const lecturerEmail = currentUser.email.trim().toLowerCase();

        const q = query(
          collection(db, "assignments"),
          where("lecturerEmail", "==", lecturerEmail)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMyAssignments(data);
      } catch (error) {
        console.error("Assignment fetch error:", error);
      }
    };

    fetchAssignments();
  }, [currentUser]);

  /* LOAD STUDENTS FROM FIRESTORE */

  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      try {
        const [year, cls] = selectedClass.split("_");

        const studentsRef = collection(
          db,
          "academicYears",
          year,
          "classes",
          cls,
          "students"
        );

        const q = query(studentsRef, orderBy("rollNumber", "asc"));

        const snapshot = await getDocs(q);

        const studentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentData);

        const initAttendance = {};
        studentData.forEach((_, index) => {
          initAttendance[index] = { status: "" };
        });

        setAttendance(initAttendance);
      } catch (error) {
        console.error("Fetch students error:", error);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  /* MARK ALL */

  const markAll = (status) => {
    const updated = {};

    students.forEach((_, index) => {
      updated[index] = { status };
    });

    setAttendance(updated);
  };

  const handleSubmitAttendance = async () => {
    const [year, cls] = selectedClass.split("_");

    const assignment = myAssignments.find(
      (a) => a.year === year && a.class === cls
    );

    const attendanceRecord = {
      lecturer: currentUser.email,
      year,
      class: cls,
      subject: assignment?.subject || "",

      date: selectedDate,
      startTime: startTime,
      endTime: endTime,

      students: students.map((s, index) => ({
        roll: s.roll,
        name: s.name,
        status: attendance[index]?.status || "Absent",
      })),
    };

    const history = JSON.parse(localStorage.getItem("attendanceHistory")) || [];
    history.push(attendanceRecord);
    localStorage.setItem("attendanceHistory", JSON.stringify(history));

    try {
      await addDoc(collection(db, "attendance"), attendanceRecord);

      alert("Attendance submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Firebase save failed");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="classes-container">
      <div className="classes-header">
        <h2>Mark Attendance</h2>
        <p>Record student attendance with detailed status</p>
      </div>

      <div className="classes-white-card">
        <div className="attendance-header-row">
          <div className="attendance-left">
            <div className="attendance-row-inputs">
              {/* CLASS */}

              <div className="attendance-select-box">
                <label>Select Class:</label>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">-- Select Class --</option>

                  {myAssignments.map((a, index) => (
                    <option key={index} value={`${a.year}_${a.class}`}>
                      {a.year} • {a.class} • {a.subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE */}

              <div className="attendance-select-box">
                <label>Select Date:</label>

                <input
                  type="date"
                  max={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* START TIME */}

              <div className="attendance-select-box">
                <label>Start Time:</label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {/* END TIME */}

              <div className="attendance-select-box">
                <label>End Time:</label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {selectedClass && (
          <div className="attendance-panel">
            <h3>Mark Attendance for Students ({students.length})</h3>

            <table className="students-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>

                  <th>
                    <div className="status-header">
                      <span>Status</span>

                      <div className="mark-all-buttons">
                        <button
                          className="mark-all-btn present"
                          onClick={() => markAll("Present")}
                        >
                          ✔ Mark All Present
                        </button>

                        <button
                          className="mark-all-btn absent"
                          onClick={() => markAll("Absent")}
                        >
                          − Mark All Absent
                        </button>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map((s, index) => (
                  <tr key={index}>
                    <td>{s.roll}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>

                    <td>
                      <div className="status-buttons">
                        {STATUS.map((st) => (
                          <button
                            key={st}
                            className={
                              attendance[index]?.status === st
                                ? `status-btn active ${st.toLowerCase()}`
                                : `status-btn ${st.toLowerCase()}`
                            }
                            onClick={() =>
                              setAttendance((prev) => ({
                                ...prev,
                                [index]: { status: st },
                              }))
                            }
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="submit-attendance">
              <button onClick={handleSubmitAttendance}>
                Submit Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerAttendanceContent;
