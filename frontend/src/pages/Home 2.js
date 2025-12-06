// import React from "react";
// import { Link } from "react-router-dom";

// function Home({ user }) {
//   const isStudent = user && user.role === "student";
//   const isInstructor = user && (user.role === "instructor" || user.role === "admin");

//   return (
//     <div className="page">
//       <div className="page-header">
//         <div>
//           <h2 className="page-title">SQL Master Class</h2>
//           <p className="page-subtitle">
//             Practice SQL, get instant feedback, and explore your data with an AI-powered assistant.
//           </p>
//         </div>
//       </div>

//       <div style={{ display: "grid", gap: 16, maxWidth: 800 }}>
//         {!user && (
//           <div className="card">
//             <div className="card-header">
//               <span className="card-title">You’re not logged in</span>
//             </div>
//             <p className="card-meta">
//               Log in through the backend (Django) and refresh this page.
//               Once logged in, you’ll automatically see your personalized dashboard.
//             </p>
//             <p className="text-muted">
//               For development, you’re using a mocked user in <code>App.js</code>.
//             </p>
//           </div>
//         )}

//         {isStudent && (
//           <>
//             <div className="card">
//               <div className="card-header">
//                 <span className="card-title">Start Practicing</span>
//               </div>
//               <p className="card-meta">
//                 Browse curated SQL interview problems with real datasets and detailed statements.
//               </p>
//               <Link to="/student/dashboard" className="btn btn-primary">
//                 Go to Student Dashboard →
//               </Link>
//             </div>
//           </>
//         )}

//         {isInstructor && (
//           <div className="card">
//             <div className="card-header">
//               <span className="card-title">Instructor Workspace</span>
//             </div>
//             <p className="card-meta">
//               View class-level analytics, track student progress, and query the database with natural language.
//             </p>
//             <Link to="/instructor/dashboard" className="btn btn-primary">
//               Go to Instructor Dashboard →
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Home;
