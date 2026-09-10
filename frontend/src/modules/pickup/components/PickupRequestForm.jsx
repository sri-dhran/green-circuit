import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Alert, Dialog, DialogContent, DialogTitle, Card, CardContent, Chip, Grid, IconButton } from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import { pickupRequestService } from '../api/pickupRequestService';
import { officeService } from '../../center/api/officeService';

const categories = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Accessories', 'Other'];

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px'
};

const centerDefault = { lat: 11.0168, lng: 76.9558 }; // Default to Coimbatore roughly

const PickupRequestForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        deviceName: '',
        deviceCategory: '',
        brand: '',
        model: '',
        quantity: 1,
        description: '',
        approximateWeight: '',
        userLocation: ''
    });
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
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
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setImagePreview(null);
        }
    };

    const handleFindCollectors = () => {
        if (!formData.deviceName || !formData.deviceCategory || !formData.description || !file) {
            setError("Please fill all required device details (Name, Category, Description) and upload a photo.");
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
                    if (!formData.userLocation) {
                        setFormData(prev => ({ ...prev, userLocation: `Lat: ${currentLoc.lat.toFixed(4)}, Lng: ${currentLoc.lng.toFixed(4)}` }));
                    }
                    fetchNearbyOffices(currentLoc);
                },
                (err) => {
                    console.warn("Geolocation denied or failed, falling back to default location", err);
                    setLocation(centerDefault);
                    fetchNearbyOffices(centerDefault);
                },
                { timeout: 8000 }
            );
        } else {
            setLocation(centerDefault);
            fetchNearbyOffices(centerDefault);
        }
    };

    const fetchNearbyOffices = async (currentLoc) => {
        try {
            let data = await officeService.getNearbyCenters(currentLoc.lat, currentLoc.lng, 50.0);
            if (!data || data.length === 0) {
                data = await officeService.getAllOffices();
            }
            setOffices(data || []);
            if (!data || data.length === 0) {
                setLocationError('No e-waste collection centers found in the database.');
            } else {
                setLocationError(null);
            }
        } catch (error) {
            console.error("Error fetching nearby offices, attempting all-offices fallback", error);
            try {
                const allOffices = await officeService.getAllOffices();
                if (allOffices && allOffices.length > 0) {
                    setOffices(allOffices);
                    setLocationError(null);
                    return;
                }
            } catch (err2) {
                console.error("Failed to fetch all offices", err2);
            }
            setLocationError('Unable to fetch office. Please ensure the backend is running.');
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
        data.append('brand', formData.brand);
        data.append('model', formData.model);
        data.append('quantity', formData.quantity);
        data.append('description', formData.description);
        if (formData.approximateWeight) data.append('approximateWeight', formData.approximateWeight);
        if (formData.userLocation) data.append('userLocation', formData.userLocation);
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
                                fullWidth
                                margin="normal"
                                label="Brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                margin="normal"
                                type="number"
                                inputProps={{ min: 0, step: 0.1 }}
                                label="Approximate Weight (kg)"
                                name="approximateWeight"
                                value={formData.approximateWeight}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                margin="normal"
                                label="Description (e.g. Old laptop not working)"
                                name="description"
                                multiline
                                rows={2}
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Your Pickup Location (Address)"
                                name="userLocation"
                                value={formData.userLocation}
                                onChange={handleChange}
                                placeholder="Enter address or allow GPS to detect"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                            Upload Device Photo * (JPG, PNG, WEBP)
                        </Typography>
                        <input 
                            type="file" 
                            accept="image/jpeg, image/png, image/webp" 
                            onChange={handleFileChange}
                            required
                        />
                        {imagePreview && (
                            <Box mt={2}>
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                            </Box>
                        )}
                    </Box>

                    <Button 
                        variant="contained" 
                        color="secondary" 
                        fullWidth 
                        size="large"
                        startIcon={<MyLocationIcon />}
                        onClick={handleFindCollectors}
                    >
                        Choose Office
                    </Button>
                </Box>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <Card sx={{ mb: 3, border: '1px solid #4caf50', bgcolor: '#f1f8e9' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" color="primary">
                                    Collection Request Confirmation
                                </Typography>
                                <Button size="small" variant="outlined" onClick={() => setSelectedOffice(null)}>
                                    Change Collector
                                </Button>
                            </Box>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={8}>
                                    <Typography variant="body1"><strong>Selected Collector:</strong> {selectedOffice.officeName || selectedOffice.name}</Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Area:</strong> {selectedOffice.area || selectedOffice.city || selectedOffice.address}</Typography>
                                    
                                    <Typography variant="body2"><strong>Device:</strong> {formData.deviceName}</Typography>
                                    <Typography variant="body2"><strong>Category:</strong> {formData.deviceCategory}</Typography>
                                    <Typography variant="body2"><strong>Description:</strong> {formData.description}</Typography>
                                    <Typography variant="body2"><strong>Location:</strong> {formData.userLocation}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    {imagePreview && (
                                        <Box display="flex" justifyContent="center">
                                            <img src={imagePreview} alt="E-Waste Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {onCancel && (
                            <Button variant="outlined" onClick={onCancel} disabled={loading}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" variant="contained" color="success" disabled={loading} size="large">
                            {loading ? <CircularProgress size={24} /> : 'Send Collection Request'}
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Map Modal */}
            <Dialog open={showMapModal} onClose={() => setShowMapModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Nearby E-Waste Offices
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowMapModal(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ minHeight: '450px' }}>
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
                        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Finding nearest centers...</Typography>
                        </Box>
                    ) : (
                        <Box>
                            {/* Collection Centers List */}
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                Select a Collection Center:
                            </Typography>
                            
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {offices.map((office) => (
                                    <Grid item xs={12} sm={6} md={4} key={office.id || office.officeId}>
                                        <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1.5, '&:hover': { borderColor: '#4caf50', boxShadow: 2 } }}>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    ♻️ {office.officeName || office.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                                                    {office.area || office.city || 'Malumichampatti'}
                                                </Typography>
                                                {office.distanceKm != null && (
                                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        <strong>Distance:</strong> {office.distanceKm} km
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {office.address}
                                                </Typography>
                                                {office.phoneNumber && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        📞 {office.phoneNumber}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Button 
                                                variant="contained" 
                                                color="success" 
                                                size="small" 
                                                sx={{ mt: 1.5 }}
                                                onClick={() => handleSelectCollector(office)}
                                            >
                                                Choose
                                            </Button>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Optional Google Map View */}
                            {isLoaded && (
                                <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
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
                                                key={office.id || office.officeId} 
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
                                                        {selectedMarker.officeName || selectedMarker.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        {selectedMarker.type || 'E-Waste Recycler'}
                                                    </Typography>
                                                    <Typography variant="body2"><strong>Address:</strong> {selectedMarker.address}</Typography>
                                                    {selectedMarker.distanceKm && (
                                                        <Typography variant="body2"><strong>Distance:</strong> {selectedMarker.distanceKm} km</Typography>
                                                    )}
                                                    <Typography variant="body2"><strong>Phone:</strong> {selectedMarker.phoneNumber}</Typography>
                                                    
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary" 
                                                        size="small" 
                                                        fullWidth 
                                                        sx={{ mt: 1 }}
                                                        onClick={() => handleSelectCollector(selectedMarker)}
                                                    >
                                                        Choose
                                                    </Button>
                                                </Box>
                                            </InfoWindow>
                                        )}
                                    </GoogleMap>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PickupRequestForm;
