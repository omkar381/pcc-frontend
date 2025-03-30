import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import StudentsList from './pages/admin/StudentsList';
import AddStudent from './pages/admin/AddStudent';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import NotesManagement from './pages/admin/NotesManagement';
import TestManagement from './pages/admin/TestManagement';
import StudentAttendance from './pages/student/Attendance';
import StudentNotes from './pages/student/Notes';
import StudentTests from './pages/student/Tests';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const handleLogin = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? 
            (userRole === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/student/dashboard" />) : 
            <Login onLogin={handleLogin} />
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="admin">
            <AdminDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="admin">
            <StudentsList onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-student" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="admin">
            <AddStudent onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/attendance" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="admin">
            <AttendanceManagement onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/notes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="admin">
            <NotesManagement onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/tests" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="admin">
            <TestManagement onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="student">
            <StudentDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/attendance" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="student">
            <StudentAttendance onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/notes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="student">
            <StudentNotes onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/student/tests" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} role={userRole} requiredRole="student">
            <StudentTests onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
