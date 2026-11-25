import React, { useEffect, useState } from "react";
import "./AdminAttendanceContent.css";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const AdminAttendanceContent = () => {

  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [year, setYear] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [yearList, setYearList] = useState([]);
  const [classList, setClassList] = useState([]);

  /* ================= LOAD ATTENDANCE ================= */

  useEffect(() => {

    const fetchAttendance = async () => {

      try {

        const snapshot = await getDocs(collection(db, "attendance"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        const sorted = data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setAttendanceData(sorted);
        setFilteredData(sorted);

      } catch (error) {
        console.error("Attendance fetch error:", error);
      }

    };

    fetchAttendance();

  }, []);

  /* ================= LOAD ALL YEARS + CLASSES ================= */

  useEffect(() => {

    const fetchYearsAndClasses = async () => {

      try {

        const yearsSnapshot = await getDocs(collection(db, "academicYears"));

        const years = [];
        const classes = [];

        for (const yearDoc of yearsSnapshot.docs) {

          const yearId = yearDoc.id;
          years.push(yearId);

          const classesSnapshot = await getDocs(
            collection(db, "academicYears", yearId, "classes")
          );

          classesSnapshot.forEach((doc) => {
            classes.push(doc.id);
          });

        }

        setYearList([...new Set(years)]);
        setClassList([...new Set(classes)]);

      } catch (error) {

        console.error("Year/Class fetch error:", error);

      }

    };

    fetchYearsAndClasses();

  }, []);

  /* ================= APPLY FILTER ================= */

  useEffect(() => {

    let result = [...attendanceData];

    if (year) {
      result = result.filter((r) => r.year === year);
    }

    if (className) {
      result = result.filter((r) => r.class === className);
    }

    if (subject) {
      result = result.filter((r) => r.subject === subject);
    }

    if (fromDate) {
      result = result.filter(
        (r) => new Date(r.date) >= new Date(fromDate)
      );
    }

    if (toDate) {
      result = result.filter(
        (r) => new Date(r.date) <= new Date(toDate)
      );
    }

    setFilteredData(result);

  }, [year, className, subject, fromDate, toDate, attendanceData]);

  /* ================= UNIQUE SUBJECTS ================= */

  const getUniqueSubjects = () =>
    [...new Set(attendanceData.map((r) => r.subject))];

  /* ================= CLEAR ATTENDANCE ================= */

  const clearAttendanceRecords = async () => {

    const confirmClear = window.confirm(
      "Are you sure you want to delete all attendance records?"
    );

    if (!confirmClear) return;

    try {

      const snapshot = await getDocs(collection(db, "attendance"));

      for (const record of snapshot.docs) {

        await deleteDoc(doc(db, "attendance", record.id));

      }

      setAttendanceData([]);
      setFilteredData([]);

      alert("All attendance records deleted.");

    } catch (error) {

      console.error("Delete attendance error:", error);

    }

  };

  return (

    <div className="classes-container">

      <div className="classes-header">
        <h2>Attendance History</h2>
        <p>View attendance using admin filters</p>
      </div>

      <div className="att-section-scroll">

        {/* FILTER PANEL */}

        <div className="classes-white-card" style={{ marginBottom: "20px" }}>

          <h3 className="attendance-card-title">Apply Filter</h3>

          <div className="filter-grid">

            {/* YEAR */}
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Academic Year</option>

              {yearList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}

            </select>

            {/* CLASS */}
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >

              <option value="">Class / Division</option>

              {classList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}

            </select>

            {/* SUBJECT */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >

              <option value="">Subject</option>

              {getUniqueSubjects().map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}

            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

          </div>

        </div>

        {/* ATTENDANCE RECORDS */}

        <div className="classes-white-card">

          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button
              className="generate-btn"
              style={{ background: "#a4161a" }}
              onClick={clearAttendanceRecords}
            >
              Clear Attendance Records
            </button>
          </div>

          {filteredData.length === 0 ? (

            <p style={{ textAlign: "center", color: "gray" }}>
              No records match the selected filters.
            </p>

          ) : (

            filteredData.slice(0, 5).map((record, idx) => (

              <div
                key={idx}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  background: "#fff",
                }}
              >

                <h3>
                  {record.year} → {record.class} → {record.subject}
                </h3>

                <p style={{ fontSize: "13px" }}>
                  Lecturer: {record.lecturer}
                </p>

                <p style={{ fontSize: "12px", color: "#777" }}>
                  Date: {new Date(record.date).toLocaleString()}
                </p>

                <table className="students-table">

                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Note</th>
                    </tr>
                  </thead>

                  <tbody>

                    {record.students.map((s, i) => (

                      <tr key={i}>

                        <td>{s.roll}</td>
                        <td>{s.name}</td>
                        <td>{s.email || "-"}</td>

                        <td
                          style={{
                            color:
                              s.status === "Present"
                                ? "#046a07"
                                : "#a4161a",
                            fontWeight: "700",
                          }}
                        >
                          {s.status}
                        </td>

                        <td>{s.note || "-"}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            ))

          )}

        </div>

      </div>

    </div>

  );

};

export default AdminAttendanceContent;