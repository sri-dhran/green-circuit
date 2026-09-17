import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const SUPER_ADMIN_EMAIL = 'sri741815@gmail.com';

const PrivateRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAuthorizedSuperAdmin = user.role === 'SUPER_ADMIN' && user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

    // Super admin page is strictly restricted to sri741815@gmail.com
    if (requiredRole === 'SUPER_ADMIN' && !isAuthorizedSuperAdmin) {
        if (user.role === 'OFFICE') {
            return <Navigate to="/dashboard" replace />;
        } else {
            return <Navigate to="/user-dashboard" replace />;
        }
    }

    if (requiredRole && requiredRole !== 'SUPER_ADMIN' && user.role !== requiredRole && !isAuthorizedSuperAdmin) {
        if (user.role === 'OFFICE') {
            return <Navigate to="/dashboard" replace />;
        } else if (user.role === 'AGENT') {
            return <Navigate to="/agent/dashboard" replace />;
        } else {
            return <Navigate to="/user-dashboard" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
