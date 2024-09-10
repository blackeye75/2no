// import React, { useEffect, useState } from "react";
// import axios from "axios"; // To make HTTP requests

// const CodeDisplay = () => {
//   const [code, setCode] = useState("");
//   const [adminCode, setAdminCode] = useState(""); // For storing admin input
//   const [message, setMessage] = useState(""); // Success or error message for admin

//   // Function to handle code injection
//   const handleInjectCode = async (e) => {
//     e.preventDefault();

//     if (adminCode.length !== 4 || !/^\d{4}$/.test(adminCode)) {
//       setMessage("Please enter a valid 4-digit numeric code.");
//       return;
//     }

//     try {
//       const response = await axios.post("http://localhost:3000/inject-code", {
//         code: adminCode,
//       });
//       setMessage(response.data.message); // Show success message from the server
//       setAdminCode(""); // Clear the input field
//     } catch (error) {
//       setMessage("Error injecting code. Please try again.");
//     }
//   };

//   useEffect(() => {
//     const socket = new WebSocket("ws://localhost:3000");
//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setCode(data.code); // Update code in UI when server sends a new code
//     };

//     return () => socket.close();
//   }, []);

//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       {/* Code Display */}
//       <h1>Current Code: {code}</h1>

//       {/* Admin Code Injection Form */}
//       <form onSubmit={handleInjectCode} style={{ marginTop: "30px" }}>
//         <label>
//           Inject 4-digit Code:
//           <input
//             type="text"
//             value={adminCode}
//             onChange={(e) => setAdminCode(e.target.value)}
//             placeholder="Enter 4-digit code"
//             maxLength="4"
//             style={{ marginLeft: "10px", padding: "5px" }}
//           />
//         </label>
//         <button
//           type="submit"
//           style={{ marginLeft: "10px", padding: "5px 10px" }}
//         >
//           Inject Code
//         </button>
//       </form>

//       {/* Message Display */}
//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// export default CodeDisplay;

import React, { useEffect, useState } from "react";
import axios from "axios";

const CodeDisplay = () => {
  const [code, setCode] = useState("");
  const [adminCode, setAdminCode] = useState(""); // For admin code input
  const [message, setMessage] = useState(""); // For success/error messages
  const [isAdmin, setIsAdmin] = useState(false); // Admin flag
  const [adminPassword, setAdminPassword] = useState(""); // Admin password input

  // WebSocket connection to display the real-time code
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCode(data.code); // Update UI when server sends new code
    };

    return () => socket.close();
  }, []);

  // Handle admin login (simple password-based for now)
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true"); // Store admin status locally
    } else {
      setMessage("Incorrect admin password.");
    }
  };

  // Handle code injection
  const handleInjectCode = async (e) => {
    e.preventDefault();

    if (adminCode.length !== 4 || !/^\d{4}$/.test(adminCode)) {
      setMessage("Please enter a valid 4-digit numeric code.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/inject-code",
        { code: adminCode },
        {
          headers: { "x-admin-token": "your-admin-secret-token" }, // Send the admin token
        }
      );
      setMessage(response.data.message);
      setAdminCode("");
    } catch (error) {
      setMessage("Error injecting code. Please try again.");
    }
  };

  // Check if the user is already an admin (stored in localStorage)
  useEffect(() => {
    const storedAdmin = localStorage.getItem("isAdmin");
    if (storedAdmin === "true") {
      setIsAdmin(true);
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* Display the current code */}
      <h1>Current Code: {code}</h1>

      {/* Admin login form */}
      {!isAdmin && (
        <form onSubmit={handleAdminLogin} style={{ marginTop: "30px" }}>
          <label>
            Admin Password:
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </label>
          <button
            type="submit"
            style={{ marginLeft: "10px", padding: "5px 10px" }}
          >
            Login
          </button>
        </form>
      )}

      {/* Only show this if admin is logged in */}
      {isAdmin && (
        <form onSubmit={handleInjectCode} style={{ marginTop: "30px" }}>
          <label>
            Inject 4-digit Code:
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Enter 4-digit code"
              maxLength="4"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </label>
          <button
            type="submit"
            style={{ marginLeft: "10px", padding: "5px 10px" }}
          >
            Inject Code
          </button>
        </form>
      )}

      {/* Message display */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default CodeDisplay;
