import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    fetch("http://localhost:6005/auth/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          navigate("/dashboard");
        }
      })
      .catch(() => {});
  }, [navigate]);

  // Google Login Function
  const loginWithGoogle = () => {
    window.open("http://localhost:6005/auth/google/callback", "_self");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Google Login Button */}
        <div className="google-login-container">
          <button className="google-login-button" onClick={loginWithGoogle}>
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRayttH1faTDjcwImFb6dwnnPXVDuU-bd5-BA&s"
              alt="Google Logo" 
              className="google-icon"
            />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
