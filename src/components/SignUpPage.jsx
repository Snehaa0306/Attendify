import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUpPage.css";
import bgImage from "../assets/signinbg.png";
import attendifyText from "../assets/attendify.png";

// Firebase imports
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const isDisabled =
    name.trim() === "" ||
    email.trim() === "" ||
    password.trim() === "" ||
    role === "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role!");
      return;
    }

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 2. Save user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date(),
      });

      // 3. If role is Lecturer, also save in faculty collection
      if (role === "Lecturer") {
        await setDoc(doc(db, "faculty", user.uid), {
          name: name,
          email: email,
        });
      }

      alert("Account created successfully!");

      // 4. Redirect based on role
      if (role === "Admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/lecturer-dashboard");
      }

      // 5. Clear form
      setName("");
      setEmail("");
      setPassword("");
      setRole("");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="signup-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="signup-box">
        <div className="signup-header">
          <img src={attendifyText} alt="Attendify" className="signuplogo-text" />
        </div>

        <h2>Create Account</h2>
        <p>Sign up to Attendify to continue.</p>

        <label className="input-label">Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="input-label">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="input-label">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="input-label">Role</label>
        <div className="role-buttons">
          <button
            type="button"
            className={role === "Lecturer" ? "active" : ""}
            onClick={() => setRole("Lecturer")}
          >
            Lecturer
          </button>
          <button
            type="button"
            className={role === "Admin" ? "active" : ""}
            onClick={() => setRole("Admin")}
          >
            Admin
          </button>
        </div>

        <button
          type="submit"
          className="signup-btn"
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          Sign Up
        </button>

        <p className="bottom-text">
          This site is protected by reCAPTCHA and the Google{" "}
          <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>{" "}
          apply.
        </p>

        <p className="signup-text">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
