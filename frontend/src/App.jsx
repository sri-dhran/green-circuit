import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './modules/user/pages/Login';
import Register from './modules/user/pages/Register';
import OfficeDashboard from './modules/center/pages/OfficeDashboard';
import UserDashboard from './modules/pickup/pages/UserDashboard';
import RewardStore from './modules/reward/pages/RewardStore';
import SuperAdminDashboard from './modules/analytics/pages/SuperAdminDashboard';
import { AuthProvider } from './modules/user/context/AuthContext';
import PrivateRoute from './modules/user/components/PrivateRoute';
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
