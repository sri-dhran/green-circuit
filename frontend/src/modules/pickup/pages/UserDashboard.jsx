import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../notification/api/notificationService';
import { Box, Container, Typography, AppBar, Toolbar, Button, Paper, Grid, Chip, Tabs, Tab, Badge, IconButton, Popover, List, ListItem, ListItemText } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PickupRequestForm from '../components/PickupRequestForm';
import PickupRequestHistory from '../components/PickupRequestHistory';

const UserDashboard = () => {
    const { user, logout, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tabIndex, setTabIndex] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
            if (refreshUser) refreshUser();
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePickupSuccess = () => {
        setTabIndex(1); // Switch to history tab on success
    };

    if (!user) return null;

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Green Circuit - User Dashboard
                    </Typography>
                    <Chip 
                        icon={<EmojiEventsIcon />} 
                        label={`${user.rewardPoints} Points`} 
                        color="secondary" 
                        sx={{ mr: 3, fontWeight: 'bold' }} 
                    />
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                        {user.name}
                    </Typography>
                    
                    <Button color="inherit" onClick={() => navigate('/reward-store')} sx={{ mr: 2, border: '1px solid white' }}>
                        Reward Store
                    </Button>
                    
                    <IconButton color="inherit" onClick={handleNotificationClick} sx={{ mr: 2 }}>
                        <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Popover
                open={Boolean(notificationAnchor)}
                anchorEl={notificationAnchor}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box sx={{ width: 320, maxHeight: 400, p: 2 }}>
                    <Typography variant="h6" gutterBottom>Notifications</Typography>
                    {notifications.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No notifications.</Typography>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {notifications.map((n) => (
                                <ListItem 
                                    key={n.id} 
                                    alignItems="flex-start" 
                                    sx={{ bgcolor: n.read ? 'transparent' : '#f0f8ff', mb: 1, borderRadius: 1 }}
                                >
                                    <ListItemText 
                                        primary={n.message} 
                                        secondary={new Date(n.createdAt).toLocaleString()} 
                                    />
                                    {!n.read && (
                                        <Button size="small" onClick={() => handleMarkAsRead(n.id)}>Read</Button>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} centered>
                        <Tab label="New Pickup Request" />
                        <Tab label="My Pickup Requests" />
                    </Tabs>
                </Paper>

                {tabIndex === 0 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, elevation: 3, borderRadius: 2, height: '100%' }}>
                            <Typography variant="h5" gutterBottom color="primary">
                                Your Profile
                            </Typography>
                            <Typography variant="body1"><strong>Name:</strong> {user.name}</Typography>
                            <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" gutterBottom color="text.secondary">
                                    How it works
                                </Typography>
                                <List dense>
                                    <ListItem><ListItemText primary="1. Enter device details & photo" /></ListItem>
                                    <ListItem><ListItemText primary="2. Find nearby e-waste collectors" /></ListItem>
                                    <ListItem><ListItemText primary="3. Select a collector on the map" /></ListItem>
                                    <ListItem><ListItemText primary="4. Submit your request" /></ListItem>
                                </List>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, elevation: 3, borderRadius: 2 }}>
                            <PickupRequestForm onSuccess={handlePickupSuccess} />
                        </Paper>
                    </Grid>
                </Grid>
                )}

                {tabIndex === 1 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Request History
                        </Typography>
                        <PickupRequestHistory />
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default UserDashboard;
