import React, { useState, useEffect } from "react";
import "./AdminReportsContent.css";

import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const AdminReportsContent = () => {
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reasonFile, setReasonFile] = useState(null);

  const [justifications, setJustifications] = useState([]);

  // 🔹 Load all justifications from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(
        collection(db, "attendanceJustifications")
      );

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setJustifications(data);
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!studentName || !studentClass || !fromDate || !toDate || !reasonFile) {
      alert("Please fill all fields and upload a document");
      return;
    }

    const reader = new FileReader();

    reader.onload = async function (e) {
      const newJustification = {
        studentName,
        studentClass,
        fromDate,
        toDate,
        fileData: e.target.result,
        fileName: reasonFile.name,
        createdAt: new Date(),
      };

      try {
        const docRef = await addDoc(
          collection(db, "attendanceJustifications"),
          newJustification
        );

        setJustifications([
          ...justifications,
          { id: docRef.id, ...newJustification },
        ]);

        setStudentName("");
        setStudentClass("");
        setFromDate("");
        setToDate("");
        setReasonFile(null);

        alert("Attendance justification submitted successfully");
      } catch (error) {
        console.error("Error saving justification:", error);
      }
    };

    reader.readAsDataURL(reasonFile);
  };

  const openFile = (fileData) => {
    const link = document.createElement("a");

    link.href = fileData;
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Attendance Justification</h2>
        <p>Review and manage student attendance justification requests</p>
      </div>

      <div className="reports-section-scroll">
        <div className="justification-card">
          <h3 className="reports-card-title">
            Submit Attendance Justification
          </h3>

          <div className="justification-form">
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Class / Section"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
            />

            <div className="date-row">
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

            <div className="file-upload">
              <label className="upload-label">Upload Reason Document</label>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setReasonFile(e.target.files[0])}
              />

              {reasonFile && (
                <p className="file-name">Selected: {reasonFile.name}</p>
              )}
            </div>

            <button onClick={handleSubmit}>Submit Justification</button>
          </div>
        </div>

        {justifications.length > 0 && (
          <div className="justification-card">
            <h3 className="reports-card-title">Submitted Justifications</h3>

            <table className="justification-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Document</th>
                </tr>
              </thead>

              <tbody>
                {justifications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.studentName}</td>
                    <td>{item.studentClass}</td>
                    <td>{item.fromDate}</td>
                    <td>{item.toDate}</td>

                    <td>
                      <button onClick={() => openFile(item.fileData)}>
                        View Document
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsContent;
