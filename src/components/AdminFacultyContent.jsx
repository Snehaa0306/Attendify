import React, { useState, useEffect } from "react";
import "./AdminFacultyContent.css";

// Firebase imports
import { db } from "../firebase";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

const AdminFacultyContent = () => {
  const [faculty, setFaculty] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editId, setEditId] = useState(null);

  // 🔥 Fetch all lecturers from users collection
  useEffect(() => {

    const q = query(
      collection(db, "users"),
      where("role", "==", "Lecturer")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const facultyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFaculty(facultyList);

    });

    return () => unsubscribe();

  }, []);

  // Update Faculty
  const handleAddFaculty = async () => {
    if (!name || !email || !editId) return;

    try {

      const facultyRef = doc(db, "users", editId);

      await updateDoc(facultyRef, {
        name: name,
        email: email
      });

      setName("");
      setEmail("");
      setEditId(null);

    } catch (error) {

      console.error("Error saving faculty:", error);

    }
  };

  const handleEdit = (facultyMember) => {
    setName(facultyMember.name);
    setEmail(facultyMember.email);
    setEditId(facultyMember.id);
  };

  const handleDelete = async (id) => {
    try {

      await deleteDoc(doc(db, "users", id));

    } catch (error) {

      console.error("Error deleting faculty:", error);

    }
  };

  return (
    <div className="faculty-container">
      {/* HEADER */}
      <div className="faculty-header">
        <h2>Faculty Management</h2>
        <p>Add, view, and manage faculty members</p>
      </div>

      {/* SCROLL AREA */}
      <div className="faculty-section-scroll">

        {/* Edit Faculty */}
        <div className="add-faculty-card">

          <h3 className="faculty-card-title">
            {editId ? "Edit Faculty Member" : "Faculty Member"}
          </h3>

          <div className="add-faculty-form">

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={handleAddFaculty}>
              Update Faculty
            </button>

          </div>
        </div>

        {/* Faculty List */}
        <div className="faculty-list-card">

          <div className="faculty-list-header">

            <h3 className="faculty-card-title">All Faculty Members</h3>

            <div className="faculty-search-box">
              <input
                type="text"
                placeholder="Search"
                className="faculty-search-input"
              />
              <button className="search-btn">🔍</button>
            </div>

          </div>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {faculty.map((f) => (

                <tr key={f.id}>

                  <td>{f.name}</td>

                  <td>{f.email}</td>

                  <td>

                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(f)}
                    >
                      ✏ Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(f.id)}
                    >
                      🗑 Delete
                    </button>

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

export default AdminFacultyContent;