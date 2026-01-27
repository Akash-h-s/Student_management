import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Backgroundstyle from './components/Backgroundstyle';
import Facilities from './components/Facilities';
import AboutUs from './components/AboutUs';
import Need from './components/Need';
import HelpUs from './components/HelpUs';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboards & Pages
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminUpload from './pages/AdminUpload';
import MarksEntry from './pages/MarksEntry';
import ChatPage from './pages/ChatPage';
import StudentDetails from './pages/StudentDetails';

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <Navigate to="/" />
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Backgroundstyle />
            <Facilities />
            <Need />
            <Footer />
          </>
        } />
        <Route path="/about" element={<><AboutUs /><Footer /></>} />
        <Route path="/helpus" element={<HelpUs />} />
        
        {/* Auth Logic: Redirect if already logged in */}
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/upload" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminUpload /></ProtectedRoute>
        } />

        {/* TEACHER ROUTES */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/teacher/marks-entry" element={
          <ProtectedRoute allowedRoles={['teacher']}><MarksEntry /></ProtectedRoute>
        } />
        <Route path="/teacher/chat" element={
          <ProtectedRoute allowedRoles={['teacher']}><ChatPage /></ProtectedRoute>
        } />

        {/* PARENT ROUTES */}
        <Route path="/parent/dashboard" element={
          <ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>
        } />
        <Route path="/parent/student-details" element={
          <ProtectedRoute allowedRoles={['parent']}><StudentDetails /></ProtectedRoute>
        } />
        <Route path="/parent/chat" element={
          <ProtectedRoute allowedRoles={['parent']}><ChatPage /></ProtectedRoute>
        } />

        {/* STUDENT ROUTES */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}