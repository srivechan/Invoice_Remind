import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Components/login";  
import Header from "./Components/header";  
import Dashboard from "./Components/Dashboard";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch logged-in user details
  useEffect(() => {
    axios.get("http://localhost:6005/auth/user", { withCredentials: true })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  // Handle logout
  const handleLogout = () => {
    axios.get("http://localhost:6005/auth/logout", { withCredentials: true })
      .then(() => {
        setUser(null);
        navigate("/");
      })
      .catch(error => console.error("Logout failed:", error));
  };

  return (
    <>
      <Header user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
      </Routes>
    </>
  );
}

export default App;
