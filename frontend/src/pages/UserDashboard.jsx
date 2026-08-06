import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { officeService } from '../api/officeService';
import { notificationService } from '../api/notificationService';
import { Box, Container, Typography, AppBar, Toolbar, Button, Paper, Grid, Card, CardContent, CardActions, Chip, CircularProgress, Alert, Tabs, Tab, Dialog, DialogContent, Badge, IconButton, Popover, List, ListItem, ListItemText } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PickupRequestForm from '../components/PickupRequestForm';
import PickupRequestHistory from '../components/PickupRequestHistory';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px'
};

const centerDefault = {
    lat: 0,
    lng: 0
};

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

const UserDashboard = () => {
    const { user, logout, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedOfficeForPickup, setSelectedOfficeForPickup] = useState(null);
    
    const [notifications, setNotifications] = useState([]);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        if (!user) return;

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setLocation(currentLoc);
                    fetchNearbyOffices(currentLoc);
                },
                (error) => {
                    setLocationError('Unable to retrieve your location');
                    fetchNearbyOffices(null); // Fetch without distance sorting
                }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser');
            fetchNearbyOffices(null);
        }

        fetchNotifications();
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

    const fetchNearbyOffices = async (currentLoc) => {
        try {
            const data = await officeService.getAllOffices();
            
            if (currentLoc) {
                // Calculate distance and sort
                const sortedData = data.map(office => {
                    const distance = calculateDistance(
                        currentLoc.lat, currentLoc.lng,
                        office.latitude, office.longitude
                    );
                    return { ...office, distance: distance.toFixed(2) };
                }).sort((a, b) => a.distance - b.distance);
                
                setOffices(sortedData);
            } else {
                setOffices(data);
            }
        } catch (error) {
            console.error("Error fetching offices", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSelectOffice = (office) => {
        setSelectedOfficeForPickup(office);
    };

    const handlePickupSuccess = () => {
        setSelectedOfficeForPickup(null);
        setTabIndex(1); // Switch to history tab
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
                        <Tab label="Find Offices" />
                        <Tab label="My Pickup Requests" />
                    </Tabs>
                </Paper>

                {tabIndex === 0 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3, mb: 4, elevation: 3, borderRadius: 2 }}>
                            <Typography variant="h5" gutterBottom color="primary">
                                Your Profile
                            </Typography>
                            <Typography variant="body1"><strong>Name:</strong> {user.name}</Typography>
                            <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <LocationOnIcon color="error" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                    {location 
                                        ? `Live GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` 
                                        : (locationError || 'Detecting location...')}
                                </Typography>
                            </Box>
                        </Paper>

                        {isLoaded && (
                            <Paper sx={{ p: 2, elevation: 3, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Live Map
                                </Typography>
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={location || centerDefault}
                                    zoom={location ? 12 : 2}
                                >
                                    {location && <Marker position={location} />}
                                    {offices.map((office) => (
                                        <Marker 
                                            key={office.id} 
                                            position={{ lat: office.latitude, lng: office.longitude }} 
                                            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
                                        />
                                    ))}
                                </GoogleMap>
                            </Paper>
                        )}
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                            Nearby E-Waste Offices
                        </Typography>
                        
                        {loading ? (
                            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                        ) : offices.length === 0 ? (
                            <Alert severity="info">No authorized offices found.</Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {offices.map(office => (
                                    <Grid item xs={12} key={office.id}>
                                        <Card elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="h6" color="primary">
                                                        {office.officeName}
                                                    </Typography>
                                                    {office.distance && (
                                                        <Chip label={`${office.distance} km away`} size="small" color="info" />
                                                    )}
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {office.address}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    <strong>Phone:</strong> {office.phoneNumber}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Hours:</strong> {office.workingHours}
                                                </Typography>
                                            </CardContent>
                                            <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
                                                <Button 
                                                    size="small" 
                                                    variant="contained" 
                                                    color="success" 
                                                    fullWidth
                                                    onClick={() => handleSelectOffice(office)}
                                                >
                                                    Select Office
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
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

            <Dialog open={!!selectedOfficeForPickup} onClose={() => setSelectedOfficeForPickup(null)} maxWidth="sm" fullWidth>
                <DialogContent>
                    {selectedOfficeForPickup && (
                        <PickupRequestForm 
                            office={selectedOfficeForPickup}
                            onSuccess={handlePickupSuccess}
                            onCancel={() => setSelectedOfficeForPickup(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default UserDashboard;
