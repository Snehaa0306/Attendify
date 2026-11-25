import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./AdminClassesContent.css";

// 🔥 Firebase Firestore imports (ADDED)
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  setDoc
} from "firebase/firestore";


import { db } from "../firebase";

const AdminClassesContent = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const [years, setYears] = useState([]);


  const [newYear, setNewYear] = useState("");
  const [studentsList, setStudentsList] = useState([]);

  const [excelFileName, setExcelFileName] = useState("No file chosen");

  const [manualRoll, setManualRoll] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualContact, setManualContact] = useState("");
  const [address, setAddress] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentNo, setParentNo] = useState("");

  useEffect(() => {

    const fetchYears = async () => {
  
      try {
  
        const snapshot = await getDocs(collection(db, "academicYears"));
  
        const yearList = snapshot.docs.map(doc => doc.id);
  
        if (yearList.length === 0) {
  
          const defaultYears = [
            "2025-26",
            "2026-27",
            "2027-28",
            "2028-29"
          ];
  
          for (const y of defaultYears) {
  
            await setDoc(
              doc(db, "academicYears", y),
              { createdAt: new Date() },
              { merge: true }
            );
  
          }
  
          setYears(defaultYears);
  
        } else {
  
          setYears(yearList);
  
        }
  
      } catch (error) {
  
        console.error("Year fetch error:", error);
  
      }
  
    };
  
    fetchYears();
  
  }, []);
  useEffect(() => {

    if (selectedYear && selectedClass) {
  
      const createStructure = async () => {
  
        try {
  
          // Create Year document
          await setDoc(
            doc(db, "academicYears", selectedYear),
            {
              createdAt: new Date()
            },
            { merge: true }
          );
  
          // Create Class document
          await setDoc(
            doc(db, "academicYears", selectedYear, "classes", selectedClass),
            {
              createdAt: new Date()
            },
            { merge: true }
          );
  
        } catch (error) {
          console.error("Year/Class creation error:", error);
        }
  
      };
  
      createStructure();
  
    }
  
  }, [selectedYear, selectedClass]);
  

  /* ================= LOAD STUDENTS (Firestore instead of localStorage) ================= */
  useEffect(() => {
    if (selectedYear && selectedClass) {
      const fetchStudents = async () => {
        try {
          const studentsRef = collection(
            db,
            "academicYears",
            selectedYear,
            "classes",
            selectedClass,
            "students"
          );

          const q = query(studentsRef, orderBy("rollNumber", "asc"));
const snapshot = await getDocs(q);

          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setStudentsList(data);
          setExcelFileName("No file chosen");
        } catch (error) {
          console.error("Fetch students error:", error);
        }
      };

      fetchStudents();
    }
  }, [selectedYear, selectedClass]);

  /* ================= YEAR HANDLER (UNCHANGED) ================= */
  const handleAddYear = async (e) => {

    e.preventDefault();
  
    if (!newYear.trim() || years.includes(newYear)) return;
  
    try {
  
      await setDoc(
        doc(db, "academicYears", newYear),
        { createdAt: new Date() },
        { merge: true }
      );
  
      setYears([...years, newYear]);
      setNewYear("");
  
    } catch (error) {
  
      console.error("Add year error:", error);
  
    }
  
  };
  /* ================= DELETE STUDENT (Firestore) ================= */
  const handleDeleteStudent = async (index) => {
    try {
      const studentId = studentsList[index].id;

      await deleteDoc(
        doc(
          db,
          "academicYears",
          selectedYear,
          "classes",
          selectedClass,
          "students",
          studentId
        )
      );

      setStudentsList(studentsList.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  /* ================= EDIT STUDENT (UNCHANGED) ================= */
  const handleEditStudent = (index) => {
    const std = studentsList[index];

    setManualRoll(std.roll);
    setManualName(std.name);
    setManualEmail(std.email);
    setManualContact(std.contact);
    setAddress(std.address);
    setParentName(std.parentName);
    setParentNo(std.parentNo);

    setEditIndex(index);
  };

  /* ================= ADD / UPDATE STUDENT (Firestore) ================= */
  const handleAddStudentManually = async () => {
    if (!manualRoll || !manualName || !manualEmail) return;

    const studentData = {
      roll: manualRoll,
      rollNumber: parseInt(manualRoll, 10) || 0, // 🔥 ADD THIS LINE
      name: manualName,
      email: manualEmail,
      contact: manualContact,
      address,
      parentName,
      parentNo,
      createdAt: new Date(),
    };
    

    try {
      if (editIndex !== null) {
        const studentId = studentsList[editIndex].id;

        await updateDoc(
          doc(
            db,
            "academicYears",
            selectedYear,
            "classes",
            selectedClass,
            "students",
            studentId
          ),
          studentData
        );

        const updated = [...studentsList];
        updated[editIndex] = { ...studentData, id: studentId };
        setStudentsList(updated);
        setEditIndex(null);
      } else {
        const studentsRef = collection(
          db,
          "academicYears",
          selectedYear,
          "classes",
          selectedClass,
          "students"
        );

        const docRef = await addDoc(studentsRef, studentData);
        setStudentsList([...studentsList, { ...studentData, id: docRef.id }]);
      }

      setManualRoll("");
      setManualName("");
      setManualEmail("");
      setManualContact("");
      setAddress("");
      setParentName("");
      setParentNo("");
    } catch (error) {
      console.error("Save student error:", error);
    }
  };

  /* ================= EXCEL UPLOAD (Firestore) ================= */
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });

      try {
        const studentsRef = collection(
          db,
          "academicYears",
          selectedYear,
          "classes",
          selectedClass,
          "students"
        );

        const saved = [];

        for (let row of rawData) {
          // 🔥 normalize column names (IMPORTANT)
          const normalizedRow = {};
          Object.keys(row).forEach((key) => {
            const normalizedKey = key
              .toLowerCase()
              .replace(/\s+/g, "")
              .replace(/[^a-z]/g, "");

            normalizedRow[normalizedKey] = row[key];
          });

          const rollValue =
  normalizedRow.rollno ||
  normalizedRow.rollnumber ||
  normalizedRow.roll ||
  "";

const student = {
  roll: rollValue,
  rollNumber: parseInt(rollValue, 10) || 0, // 🔥 ADD THIS LINE
  name: normalizedRow.name || "",
  email: normalizedRow.email || "",
  contact:
    normalizedRow.contactno ||
    normalizedRow.contact ||
    "",
  address: normalizedRow.address || "",
  parentName: normalizedRow.parentname || "",
  parentNo: normalizedRow.parentcontact || "",
  createdAt: new Date(),
};


          const docRef = await addDoc(studentsRef, student);
          saved.push({ ...student, id: docRef.id });
        }

        // 🔥 SORT BY ROLL NUMBER (NUMERIC)
        saved.sort((a, b) => {
          const rollA = parseInt(a.roll, 10) || 0;
          const rollB = parseInt(b.roll, 10) || 0;
          return rollA - rollB;
        });

        setStudentsList(saved);
      } catch (error) {
        console.error("Excel upload error:", error);
      }
    };

    reader.readAsBinaryString(file);
  };

  /* ================= UI (100% UNCHANGED) ================= */
  return (
    <div className="classes-container">
      {/* Header */}
      <div className="classes-header">
        <h2>Class Management</h2>
        <p>Add academic years, manage classes, and upload student data</p>
      </div>

      {/* ===== ADD YEAR FORM ===== */}
      {!selectedYear && (
        <form className="add-year-form" onSubmit={handleAddYear}>
          <h3 className="add-year-title">Add Academic Year</h3>
          <div className="add-year-input-row">
            <input
              type="text"
              placeholder="Add Academic Year (e.g. 2025-26)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            />
            <button type="submit">Add Year</button>
          </div>
        </form>
      )}

      {/* ===== YEAR SELECTION ===== */}
      {!selectedYear && (
        <>
          <p>Select Academic Year</p>
          <div className="classes-grid">
            {years.map((year, index) => (
              <div
                key={index}
                className="class-box"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== CLASS SELECTION ===== */}
      {selectedYear && !selectedClass && (
        <div className="year-classes-scroll">
          <div className="header-row">
            <h2>Academic Year: {selectedYear}</h2>
            <button className="back-btn" onClick={() => setSelectedYear(null)}>
              ← Back
            </button>
          </div>

          <h2 className="section-title">Undergraduate</h2>
          <div className="classes-grid">
            {["FY-CS", "SY-CS", "TY-CS"].map((cls) => (
              <div
                key={cls}
                className="class-box"
                onClick={() => setSelectedClass(cls)}
              >
                {cls}
              </div>
            ))}
          </div>

          <h2 className="section-title">Postgraduate</h2>
          <div className="classes-grid">
            {[
              "MSC-CS PART 1",
              "MSC-CS PART 2",
              "MSC-IT PART 1",
              "MSC-IT PART 2",
            ].map((cls) => (
              <div
                key={cls}
                className="class-box"
                onClick={() => setSelectedClass(cls)}
              >
                {cls}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STUDENT SECTION ===== */}
      {selectedYear && selectedClass && (
        <div className="student-section-scroll">
          <div className="header-row">
            <h2>
              {selectedYear} → {selectedClass}
            </h2>
            <button className="back-btn" onClick={() => setSelectedClass(null)}>
              ← Back
            </button>
          </div>

          {/* ===== EXCEL UPLOAD BOX ===== */}
          <div className="excel-upload-card">
            <div className="excel-upload-inline">
              <span className="excel-upload-title">
                Upload Student Excel :-
              </span>

              <input
                type="file"
                id="excelFile"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                hidden
              />

              <label htmlFor="excelFile" className="excel-file-input">
                Choose Excel File
              </label>

              <span className="excel-file-name">{excelFileName}</span>
            </div>
          </div>

          {/* ===== ADD STUDENT MANUALLY BOX ===== */}
          <div className="manual-add-card">
            <span className="manual-add-title">Add Student Manually</span>

            {/* Row 1 */}
            <div className="manual-add-inline">
              <input
                type="text"
                placeholder="Roll No"
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
              />

              <input
                type="text"
                placeholder="Student Name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />

              <input
                type="text"
                placeholder="Contact No"
                value={manualContact}
                onChange={(e) => setManualContact(e.target.value)}
              />
            </div>

            {/* Row 2 */}
            <div className="manual-add-inline">
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input
                type="text"
                placeholder="Parent Name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Parent Contact No"
                value={parentNo}
                onChange={(e) => setParentNo(e.target.value)}
              />

              <button onClick={handleAddStudentManually}>
                {editIndex !== null ? "Update" : "+ Add"}
              </button>
            </div>
          </div>

          {/* ===== STUDENT TABLE ===== */}
          {studentsList.length > 0 && (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact No</th>
                  <th>Address</th>
                  <th>Parent Name</th>
                  <th>Parent Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.map((std, index) => (
                  <tr key={index}>
                    <td>{std.roll}</td>
                    <td>{std.name}</td>
                    <td>{std.email}</td>
                    <td>{std.contact}</td>
                    <td>{std.address}</td>
                    <td>{std.parentName}</td>
                    <td>{std.parentNo}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditStudent(index)}
                      >
                        ✏
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteStudent(index)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminClassesContent;
