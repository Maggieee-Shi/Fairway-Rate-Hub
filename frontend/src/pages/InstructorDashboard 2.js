// import React from "react";
// import { Link } from "react-router-dom";

// function InstructorDashboard({ user }) {
//   return (
//     <div className="page">
//       <div className="page-header">
//         <div>
//           <h2 className="page-title">Instructor Dashboard</h2>
//           <p className="page-subtitle">
//             Hi, {user?.name || "instructor"} — monitor learner performance and explore cohort insights.
//           </p>
//         </div>
//       </div>

//       <div style={{ display: "grid", gap: 16, maxWidth: 800 }}>
//         <div className="card">
//           <div className="card-header">
//             <span className="card-title">Problem Bank</span>
//           </div>
//           <p className="card-meta">
//             Browse and inspect all active problems, their tags, difficulty, and usage statistics.
//           </p>
//           <Link to="/problems" className="btn btn-primary">
//             View Problems →
//           </Link>
//         </div>

//         <div className="card">
//           <div className="card-header">
//             <span className="card-title">Class Analytics</span>
//           </div>
//           <p className="card-meta">
//             See hardest problems, cohort pass rates, and learner rankings powered by dynamic SQL.
//           </p>
//           <Link to="/analytics" className="btn btn-outline">
//             Open Analytics
//           </Link>
//         </div>

//         <div className="card">
//           <div className="card-header">
//             <span className="card-title">Instructor Chat Assistant</span>
//           </div>
//           <p className="card-meta">
//             Ask questions like “Which students are struggling with window functions?” in plain English.
//           </p>
//           <Link to="/chat/instructor" className="btn btn-outline">
//             Open Chat
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default InstructorDashboard;
