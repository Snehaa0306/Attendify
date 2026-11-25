import React, { useEffect, useState } from "react";
import "./LecturerReportsContent.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const LecturerReportsContent = () => {

  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [reports, setReports] = useState([]);

  /* FORMAT TIME */

  const formatTime = (time) => {
    if (!time) return "--:--";

    const [hour, minute] = time.split(":");

    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    if (h === 0) h = 12;

    return `${h}:${minute} ${ampm}`;
  };

  /* FORMAT DATE */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  /* FETCH REPORTS */

  useEffect(() => {

    const fetchReports = async () => {

      if (!currentUser?.email) return;

      try {

        const lecturerEmail = currentUser.email.trim().toLowerCase();

        const q = query(
          collection(db, "attendance"),
          where("lecturer", "==", lecturerEmail)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => doc.data());

        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setReports(data);

      } catch (err) {

        console.error("Report fetch error:", err);

      }

    };

    fetchReports();

  }, [currentUser]);

  return (

    <div className="classes-container">

      <div className="classes-header">
        <h2>Attendance Reports</h2>
        <p>View attendance sessions you marked</p>
      </div>

      <div className="classes-white-card">

        {reports.length === 0 ? (

          <p className="no-report">
            No attendance records found.
          </p>

        ) : (

          reports.map((r, index) => {

            let present = 0;
            let absent = 0;

            r.students.forEach((s) => {
              if (s.status === "Present") present++;
              else absent++;
            });

            return (

              <div className="report-card" key={index}>

                <h3>
                  {r.year} • {r.class} • {r.subject}
                </h3>

                <p>
                  Date: {formatDate(r.date)}
                </p>

                <p>
                  Time: {formatTime(r.startTime)} - {formatTime(r.endTime)}
                </p>

                <p>
                  Present:
                  <span className="present-count"> {present}</span>

                  {" | "}

                  Absent:
                  <span className="absent-count"> {absent}</span>
                </p>

              </div>

            );

          })

        )}

      </div>

    </div>

  );

};

export default LecturerReportsContent;