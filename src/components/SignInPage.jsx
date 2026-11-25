import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignInPage.css";
import bgImage from "../assets/signinbg.png";
import attendifyText from "../assets/attendify.png";

// Firebase imports
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isDisabled = email.trim() === "" || password.trim() === "" || loading;

  const handleLogin = async () => {
    setLoading(true);

    try {
      // 1. Login with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 2. Get user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        alert(
          "Your account exists but profile data is missing. Please contact admin."
        );
        return;
      }

      const userData = userSnap.data();

      // 🔥 SAVE CURRENT USER (THIS WAS MISSING BEFORE)
      const currentUser = {
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        role: userData.role,
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      alert("Login successful!");

      // 3. Redirect based on role
      if (userData.role === "Admin") {
        navigate("/admin-dashboard");
      } else if (userData.role === "Lecturer") {
        navigate("/lecturer-dashboard");
      } else {
        alert("Your account role is invalid. Please contact admin.");
      }
    } catch (error) {
      console.error(error.code, error.message);

      // Proper & user-friendly error messages
      switch (error.code) {
        case "auth/invalid-email":
          alert("Please enter a valid email address.");
          break;

        case "auth/missing-password":
          alert("Please enter your password.");
          break;

        case "auth/user-not-found":
          alert("User not signed up. Please create an account first.");
          break;

        case "auth/wrong-password":
          alert("Incorrect password. Please try again.");
          break;

        case "auth/invalid-credential":
          alert(
            "Invalid email or password. If you are not registered, please sign up."
          );
          break;

        case "auth/too-many-requests":
          alert("Too many failed attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          alert("Network error. Please check your internet connection.");
          break;

        default:
          alert("Login failed. " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="signin-box">
        <div className="signin-header">
          <img
            src={attendifyText}
            alt="Attendify"
            className="signinlogo-text"
          />
        </div>

        <h2>Welcome</h2>
        <p>Log in to Attendify to continue.</p>

        {/* Google login (kept as you had) */}
        <button className="google-btn" disabled>
          <span className="google-icon">G</span> Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="continue-btn"
          disabled={isDisabled}
          onClick={handleLogin}
        >
          {loading ? "Logging in..." : "Continue"}
        </button>

        <p className="bottom-text">
          This site is protected by reCAPTCHA and the Google{" "}
          <a href="#">Privacy Policy</a> and{" "}
          <a href="#">Terms of Service</a> apply.
        </p>

        <p className="signup-text">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
