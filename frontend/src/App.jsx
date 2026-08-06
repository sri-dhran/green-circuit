import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OfficeDashboard from './pages/OfficeDashboard';
import UserDashboard from './pages/UserDashboard';
import RewardStore from './pages/RewardStore';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute requiredRole="OFFICE"><OfficeDashboard /></PrivateRoute>} />
          <Route path="/user-dashboard" element={<PrivateRoute requiredRole="USER"><UserDashboard /></PrivateRoute>} />
          <Route path="/reward-store" element={<PrivateRoute requiredRole="USER"><RewardStore /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requiredRole="SUPER_ADMIN"><SuperAdminDashboard /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
