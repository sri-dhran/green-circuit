import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, AppBar, Toolbar, Button, Paper, Tabs, Tab } from '@mui/material';
import OfficeList from '../components/OfficeList';
import OfficeForm from '../components/OfficeForm';
import OfficeRequestList from '../components/OfficeRequestList';

const OfficeDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [tabIndex, setTabIndex] = useState(0);
    const [editingOffice, setEditingOffice] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        if (newValue === 0) {
            setEditingOffice(null);
        }
    };

    const handleEdit = (office) => {
        setEditingOffice(office);
        setTabIndex(1);
    };

    const handleSaveSuccess = () => {
        setEditingOffice(null);
        setTabIndex(0);
    };

    if (!user) return null;

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #1976d2 30%, #00d4ff 90%)' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Office Management Dashboard
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                        {user.name} ({user.role})
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="View / Search Offices" />
                        <Tab label={editingOffice ? "Edit Office" : "Add New Office"} />
                        <Tab label="Pending Requests" />
                    </Tabs>
                </Paper>

                {tabIndex === 0 && (
                    <Paper sx={{ p: 3, elevation: 3 }}>
                        <OfficeList onEdit={handleEdit} />
                    </Paper>
                )}

                {tabIndex === 1 && (
                    <Paper sx={{ p: 3, elevation: 3 }}>
                        <OfficeForm office={editingOffice} onSuccess={handleSaveSuccess} />
                    </Paper>
                )}
            </Container>
        </Box>
    );
};

export default OfficeDashboard;
