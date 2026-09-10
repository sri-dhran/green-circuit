import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Alert, Dialog, DialogContent, DialogTitle, Card, CardContent, Chip, Grid, IconButton } from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import { pickupRequestService } from '../api/pickupRequestService';
import { officeService } from '../../center/api/officeService';

const categories = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Accessories', 'Other'];
const conditions = ['New', 'Good', 'Fair', 'Poor', 'Broken'];

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px'
};

const centerDefault = { lat: 11.0168, lng: 76.9558 }; // Default to Coimbatore roughly

const PickupRequestForm = ({ onSuccess, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        deviceName: '',
        deviceCategory: '',
        quantity: 1,
        condition: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Map & Location State
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [offices, setOffices] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedOffice, setSelectedOffice] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFindCollectors = () => {
        if (!formData.deviceName || !formData.deviceCategory || !formData.condition || !file) {
            setError("Please fill all required device details and upload a photo.");
            return;
        }
        setError(null);
        setShowMapModal(true);
        setMapLoading(true);

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
                (err) => {
                    setLocationError('Unable to retrieve your location or permission denied.');
                    setMapLoading(false);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser.');
            setMapLoading(false);
        }
    };

    const fetchNearbyOffices = async (currentLoc) => {
        try {
            const data = await officeService.getNearbyCenters(currentLoc.lat, currentLoc.lng, 10.0);
            setOffices(data);
            if (data.length === 0) {
                setLocationError('No nearby e-waste collection centers were found within 10 km.');
            }
        } catch (error) {
            console.error("Error fetching nearby offices", error);
            setLocationError('Failed to fetch nearby collection centers.');
        } finally {
            setMapLoading(false);
        }
    };

    const handleSelectCollector = (office) => {
        setSelectedOffice(office);
        setShowMapModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOffice) {
            setError("Please select a collection center first.");
            return;
        }

        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('officeId', selectedOffice.id);
        data.append('deviceName', formData.deviceName);
        data.append('deviceCategory', formData.deviceCategory);
        data.append('quantity', formData.quantity);
        data.append('condition', formData.condition);
        data.append('file', file);
        if (location) {
            data.append('latitude', location.lat);
            data.append('longitude', location.lng);
        }

        try {
            await pickupRequestService.createRequest(data);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit pickup request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom color="primary">
                E-Waste Submission
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!selectedOffice ? (
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                margin="normal"
                                label="Device Name"
                                name="deviceName"
                                value={formData.deviceName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                required
                                fullWidth
                                margin="normal"
                                label="Device Category"
                                name="deviceCategory"
                                value={formData.deviceCategory}
                                onChange={handleChange}
                            >
                                {categories.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                margin="normal"
                                type="number"
                                inputProps={{ min: 1 }}
                                label="Quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                required
                                fullWidth
                                margin="normal"
                                label="Condition"
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                            >
                                {conditions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                            Upload Device Photo *
                        </Typography>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            required
                        />
                    </Box>

                    <Button 
                        variant="contained" 
                        color="secondary" 
                        fullWidth 
                        size="large"
                        startIcon={<MyLocationIcon />}
                        onClick={handleFindCollectors}
                    >
                        Find Nearby Collectors
                    </Button>
                </Box>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <Card sx={{ mb: 3, border: '1px solid #4caf50', bgcolor: '#f1f8e9' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="h6" color="primary">
                                    Selected Collection Center
                                </Typography>
                                <Button size="small" variant="outlined" onClick={() => setSelectedOffice(null)}>
                                    Change Collector
                                </Button>
                            </Box>
                            <Typography variant="body1"><strong>Name:</strong> {selectedOffice.officeName}</Typography>
                            <Typography variant="body2"><strong>Area:</strong> {selectedOffice.area || selectedOffice.address}</Typography>
                            {selectedOffice.distanceKm && (
                                <Typography variant="body2"><strong>Distance:</strong> {selectedOffice.distanceKm} km</Typography>
                            )}
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {onCancel && (
                            <Button variant="outlined" onClick={onCancel} disabled={loading}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" variant="contained" color="success" disabled={loading} size="large">
                            {loading ? <CircularProgress size={24} /> : 'Continue & Submit'}
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Map Modal */}
            <Dialog open={showMapModal} onClose={() => setShowMapModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Nearby E-Waste Collectors
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowMapModal(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ minHeight: '500px' }}>
                    {locationError && (
                        <Box mb={2}>
                            <Alert severity="warning" action={
                                <Button color="inherit" size="small" onClick={handleFindCollectors}>
                                    Search Again
                                </Button>
                            }>
                                {locationError}
                            </Alert>
                        </Box>
                    )}
                    
                    {mapLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Finding nearest centers...</Typography>
                        </Box>
                    ) : isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={location || centerDefault}
                            zoom={location ? 12 : 10}
                        >
                            {location && (
                                <Marker 
                                    position={location} 
                                    icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                                    title="Your Location"
                                />
                            )}
                            
                            {offices.map((office) => (
                                <Marker 
                                    key={office.id} 
                                    position={{ lat: office.latitude, lng: office.longitude }} 
                                    icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
                                    onClick={() => setSelectedMarker(office)}
                                />
                            ))}

                            {selectedMarker && (
                                <InfoWindow
                                    position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                                    onCloseClick={() => setSelectedMarker(null)}
                                >
                                    <Box sx={{ minWidth: 200, p: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {selectedMarker.officeName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {selectedMarker.type || 'E-Waste Recycler'}
                                        </Typography>
                                        <Typography variant="body2"><strong>Address:</strong> {selectedMarker.address}</Typography>
                                        {selectedMarker.distanceKm && (
                                            <Typography variant="body2"><strong>Distance:</strong> {selectedMarker.distanceKm} km</Typography>
                                        )}
                                        <Typography variant="body2"><strong>Phone:</strong> {selectedMarker.phoneNumber}</Typography>
                                        {selectedMarker.services && (
                                            <Typography variant="body2"><strong>Services:</strong> {selectedMarker.services}</Typography>
                                        )}
                                        <Chip 
                                            label={selectedMarker.status || 'ACTIVE'} 
                                            size="small" 
                                            color="success" 
                                            sx={{ mt: 1, mb: 1, mr: 1 }} 
                                        />
                                        
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            size="small" 
                                            fullWidth 
                                            sx={{ mt: 1 }}
                                            onClick={() => handleSelectCollector(selectedMarker)}
                                        >
                                            Select Collector
                                        </Button>
                                    </Box>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    ) : (
                        <Typography>Loading map...</Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PickupRequestForm;
