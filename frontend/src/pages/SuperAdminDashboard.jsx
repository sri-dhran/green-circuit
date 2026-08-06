import React, { useState, useEffect, useContext } from 'react';
import { Box, Container, Typography, AppBar, Toolbar, Button, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { analyticsService } from '../api/analyticsService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SuperAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await analyticsService.getStats();
                setStats(data);
            } catch (err) {
                setError('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f0f2f5' }}>
            <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Green Circuit - Global Analytics
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                        {user.name} (Super Admin)
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>
                    Platform Overview
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                ) : stats ? (
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
                                <PeopleIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h3" color="textPrimary">{stats.totalUsers}</Typography>
                                <Typography variant="subtitle1" color="textSecondary">Total Users</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
                                <DeleteIcon color="secondary" sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h3" color="textPrimary">{stats.totalRequests}</Typography>
                                <Typography variant="subtitle1" color="textSecondary">Pickup Requests</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h3" color="textPrimary">{stats.completedPickups}</Typography>
                                <Typography variant="subtitle1" color="textSecondary">Completed Pickups</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 2, bgcolor: '#e8f5e9' }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h3" color="success.main">{stats.totalEwasteItemsCollected}</Typography>
                                <Typography variant="subtitle1" color="textSecondary">Total E-Waste Items Saved</Typography>
                            </Card>
                        </Grid>
                    </Grid>
                ) : null}
            </Container>
        </Box>
    );
};

export default SuperAdminDashboard;
