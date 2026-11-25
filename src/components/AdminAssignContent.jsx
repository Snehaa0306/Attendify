import React, { useState, useEffect } from "react";
import "./AdminAssignContent.css";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

const AdminAssignContent = () => {

  const [assignments, setAssignments] = useState([]);

  const [facultyList, setFacultyList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [classMap, setClassMap] = useState({});

  const [teacher, setTeacher] = useState("");
  const [year, setYear] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  /* ================= FETCH ASSIGNMENTS ================= */

  const fetchAssignments = async () => {

    try {

      const snapshot = await getDocs(collection(db, "assignments"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAssignments(data);

    } catch (error) {

      console.error("Assignment fetch error:", error);

    }

  };

  /* ================= FETCH FACULTY ================= */

  const fetchFaculty = async () => {

    try {

      const snapshot = await getDocs(collection(db, "faculty"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFacultyList(data);

    } catch (error) {

      console.error("Faculty fetch error:", error);

    }

  };

  /* ================= FETCH YEARS + CLASSES ================= */

  const fetchYearsAndClasses = async () => {

    try {

      const yearsSnapshot = await getDocs(collection(db, "academicYears"));

      const years = [];
      const classObj = {};

      for (const yearDoc of yearsSnapshot.docs) {

        const yearId = yearDoc.id;

        const classesSnapshot = await getDocs(
          collection(db, "academicYears", yearId, "classes")
        );

        if (classesSnapshot.empty) continue;

        const validClasses = [];

        for (const classDoc of classesSnapshot.docs) {

          const classId = classDoc.id;

          const studentsSnapshot = await getDocs(
            collection(
              db,
              "academicYears",
              yearId,
              "classes",
              classId,
              "students"
            )
          );

          if (!studentsSnapshot.empty) {
            validClasses.push(classId);
          }

        }

        if (validClasses.length > 0) {
          years.push(yearId);
          classObj[yearId] = validClasses;
        }

      }

      setYearList(years);
      setClassMap(classObj);

    } catch (error) {

      console.error("Year/Class fetch error:", error);

    }

  };

  /* ================= LOAD DATA ================= */

  useEffect(() => {

    fetchFaculty();
    fetchYearsAndClasses();
    fetchAssignments();

  }, []);

  /* ================= ASSIGN ================= */

  const handleAssign = async () => {

    if (!teacher || !year || !className || !subject) return;

    const newAssignment = {
      lecturerEmail: teacher.trim().toLowerCase(),
      year,
      class: className,
      subject
    };

    try {

      if (editIndex !== null) {

        const assignmentId = assignments[editIndex].id;

        await updateDoc(
          doc(db, "assignments", assignmentId),
          newAssignment
        );

        const updated = [...assignments];
        updated[editIndex] = { id: assignmentId, ...newAssignment };

        setAssignments(updated);
        setEditIndex(null);

      } else {

        const docRef = await addDoc(
          collection(db, "assignments"),
          newAssignment
        );

        setAssignments([
          ...assignments,
          { id: docRef.id, ...newAssignment }
        ]);

      }

      setTeacher("");
      setYear("");
      setClassName("");
      setSubject("");

    } catch (error) {

      console.error("Assignment save error:", error);

    }

  };

  /* ================= EDIT ================= */

  const handleEdit = (index) => {

    const data = assignments[index];

    setTeacher(data.lecturerEmail);
    setYear(data.year);
    setClassName(data.class);
    setSubject(data.subject);

    setEditIndex(index);

  };

  /* ================= DELETE ================= */

  const handleDelete = async (index) => {

    try {

      const assignmentId = assignments[index].id;

      await deleteDoc(doc(db, "assignments", assignmentId));

      const updated = assignments.filter((_, i) => i !== index);
      setAssignments(updated);

    } catch (error) {

      console.error("Delete error:", error);

    }

  };

  return (
    <div className="assign-container">

      <div className="assign-header">
        <h2>Assignments</h2>
        <p>Assign faculty to Year, Class and Subject</p>
      </div>

      <div className="assign-section-scroll">

        {/* ASSIGN FORM */}

        <div className="add-assign-card">

          <h3 className="assign-card-title">
            {editIndex !== null ? "Edit Assignment" : "Assign Teacher"}
          </h3>

          <div className="add-assign-form">

            {/* Faculty */}

            <select
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
            >
              <option value="">Select Faculty</option>

              {facultyList.map((f) => (
                <option
                  key={f.id}
                  value={f.email.trim().toLowerCase()}
                >
                  {f.name} ({f.email})
                </option>
              ))}

            </select>

            {/* Year */}

            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setClassName("");
              }}
            >
              <option value="">Select Year</option>

              {yearList.map((y, index) => (
                <option key={index} value={y}>
                  {y}
                </option>
              ))}

            </select>

            {/* Class */}

            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              disabled={!year}
            >
              <option value="">Select Class</option>

              {year &&
                classMap[year] &&
                classMap[year].map((cls, index) => (
                  <option key={index} value={cls}>
                    {cls}
                  </option>
                ))}

            </select>

            {/* Subject */}

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <button onClick={handleAssign}>
              {editIndex !== null ? "Update" : "+ Assign"}
            </button>

          </div>
        </div>

        {/* ASSIGNMENT TABLE */}

        <div className="assign-list-card">

          <h3 className="assign-card-title">All Assignments</h3>

          <table>

            <thead>
              <tr>
                <th>Faculty Email</th>
                <th>Year</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {assignments.map((a, index) => (

                <tr key={a.id}>
                  <td>{a.lecturerEmail}</td>
                  <td>{a.year}</td>
                  <td>{a.class}</td>
                  <td>{a.subject}</td>

                  <td>
                    <button onClick={() => handleEdit(index)}>✏</button>
                    <button onClick={() => handleDelete(index)}>🗑</button>
                  </td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default AdminAssignContent;