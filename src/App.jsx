import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import StudentDashboard from './pages/StudentDashboard';
import StudentPlay from './pages/StudentPlay';
import TeacherLogin from './pages/TeacherLogin';
import TeacherSignup from './pages/TeacherSignup';
import Dashboard from './pages/Dashboard';
import EditQuiz from './pages/EditQuiz';

function PrivateRoute({ children, allowedRole }) {
  const { currentUser, userRole } = useAuth();
  if (!currentUser) return <Navigate to="/" />;
  if (allowedRole && userRole !== allowedRole) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Aluno */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute allowedRole="aluno">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/play/:quizId"
          element={
            <PrivateRoute allowedRole="aluno">
              <StudentPlay />
            </PrivateRoute>
          }
        />

        {/* Professor */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/signup" element={<TeacherSignup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRole="professor">
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/quiz/edit/:quizId"
          element={
            <PrivateRoute allowedRole="professor">
              <EditQuiz />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;