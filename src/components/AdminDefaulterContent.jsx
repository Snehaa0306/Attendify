import React, { useState, useEffect } from "react";
import "./AdminDefaulterContent.css";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const MIN_PERCENTAGE = 75;

const AdminDefaulterContent = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [year, setYear] = useState("");
  const [className, setClassName] = useState("");
  const [defaulters, setDefaulters] = useState([]);
  const [history, setHistory] = useState([]);
  const [showResult, setShowResult] = useState(false); // ✅ NEW

  // 🔹 FETCH ATTENDANCE
  useEffect(() => {
    const fetchAttendance = async () => {
      const snapshot = await getDocs(collection(db, "attendance"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(data);
    };
    fetchAttendance();
  }, []);

  // 🔹 UNIQUE YEARS
  const years = [...new Set(history.map((r) => r.year))];

  // 🔹 CLASSES BASED ON YEAR
  const classes = [
    ...new Set(history.filter((r) => r.year === year).map((r) => r.class)),
  ];

  // 🔥 GENERATE DEFAULTER LIST
  const generateDefaulterList = () => {
    if (!fromDate || !toDate || !year || !className) {
      alert("Please select Year, Class and Date range");
      return;
    }

    setShowResult(true); // ✅ OPEN RESULT SECTION

    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const filteredRecords = history.filter((r) => {
      if (!r.date || !r.students) return false;

      const recordDate = new Date(r.date);
      if (isNaN(recordDate)) return false;

      return (
        r.year === year &&
        r.class === className &&
        recordDate >= start &&
        recordDate <= end
      );
    });

    if (filteredRecords.length === 0) {
      setDefaulters([]);
      return;
    }

    const studentMap = {};

    filteredRecords.forEach((record) => {
      record.students.forEach((s) => {
        if (!s.roll) return;

        if (!studentMap[s.roll]) {
          studentMap[s.roll] = {
            roll: s.roll,
            name: s.name,
            present: 0,
            total: 0,
          };
        }

        studentMap[s.roll].total += 1;

        if (s.status === "Present") {
          studentMap[s.roll].present += 1;
        }
      });
    });

    const result = Object.values(studentMap).map((s) => {
      const percentage = Math.round((s.present / s.total) * 100);
      return {
        ...s,
        percentage,
        status: percentage < MIN_PERCENTAGE ? "Defaulter" : "Safe",
      };
    });

    setDefaulters(result);
  };

  // ⬇️ DOWNLOAD CSV
  const downloadCSV = () => {
    if (defaulters.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Roll",
      "Name",
      "Present",
      "Total Classes",
      "Attendance %",
      "Status",
    ];

    const rows = defaulters.map((s) => [
      s.roll,
      s.name,
      s.present,
      s.total,
      s.percentage,
      s.status,
    ]);

    const csvContent =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Attendance_${className}_${year}.csv`;
    link.click();
  };

  return (
    <div className="classes-container">
      <div className="classes-header">
        <h2>Class Attendance Summary</h2>
        <p>Defaulter & Non-Defaulter List</p>
      </div>

      <div className="attendance-section-scroll">
        {/* 🔹 FILTER CARD */}
        <div className="classes-white-card filter-card">
          <h3 className="attendance-card-title">Select Filters</h3>

          <div className="defaulter-filter-row">
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Academic Year</option>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>

            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              <option value="">Class</option>
              {classes.map((c) => (
                <option key={c}>{c}</option>
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

            <button className="generate-btn" onClick={generateDefaulterList}>
              Generate
            </button>
          </div>
        </div>

        {/* 🔹 RESULT CARD (OPENS AFTER GENERATE) */}
        {showResult && (
          <div className="classes-white-card result-card">
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <h2 style={{ marginTop: "1px", marginBottom: "0" }}>
                Attendance Report
              </h2>

              <button
                onClick={downloadCSV}
                style={{
                  backgroundColor: "#0a7d00",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Download CSV
              </button>
            </div>

            {/* 🔹 INFO STRIP (NEW – MATCHES SCREENSHOT) */}
            <div
              style={{
                background: "#eef6f8",
                borderLeft: "6px solid #7b0000",
                padding: "14px 18px",
                borderRadius: "12px",
                marginBottom: "18px",
                fontSize: "16px",
                color: "#2b2b2b",
              }}
            >
              Attendance of <b>{className}</b> ({year}) from <b>{fromDate}</b>{" "}
              to <b>{toDate}</b>
            </div>

            {/* TABLE (UNCHANGED) */}
            {defaulters.length === 0 ? (
              <p style={{ textAlign: "center", color: "gray" }}>
                No records found.
              </p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Roll</th>
                    <th>Name</th>
                    <th>Total Classes</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulters.map((s, i) => (
                    <tr key={i}>
                      <td>{s.roll}</td>
                      <td>{s.name}</td>
                      <td>
                        {s.present} / {s.total}
                      </td>
                      <td>{s.percentage}%</td>
                      <td
                        style={{
                          color:
                            s.status === "Defaulter" ? "#c00000" : "#0a7d00",
                          fontWeight: "600",
                        }}
                      >
                        {s.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDefaulterContent;
