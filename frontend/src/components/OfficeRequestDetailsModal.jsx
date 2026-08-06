import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, TextField, Grid, CircularProgress } from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { pickupRequestService } from '../api/pickupRequestService';

const containerStyle = {
    width: '100%',
    height: '250px',
    borderRadius: '8px'
};

const OfficeRequestDetailsModal = ({ request, open, onClose, onActionComplete }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [loading, setLoading] = useState(false);

    const [collectorName, setCollectorName] = useState('');
    const [collectorPhone, setCollectorPhone] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const handleApprove = async () => {
        setLoading(true);
        try {
            await pickupRequestService.updateRequestStatus(request.id, 'APPROVED');
            onActionComplete();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        setLoading(true);
        try {
            await pickupRequestService.updateRequestStatus(request.id, 'REJECTED', rejectionReason);
            onActionComplete();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAssignCollector = async () => {
        if (!collectorName || !collectorPhone || !pickupDate || !pickupTime) return;
        setLoading(true);
        try {
            await pickupRequestService.assignCollector(request.id, collectorName, collectorPhone, pickupDate, pickupTime);
            onActionComplete();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Request Verification</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom color="primary">User Details</Typography>
                        <Typography variant="body2"><strong>Name:</strong> {request.user.name}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {request.user.email}</Typography>
                        
                        <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Device Details</Typography>
                        <Typography variant="body2"><strong>Device:</strong> {request.deviceName}</Typography>
                        <Typography variant="body2"><strong>Category:</strong> {request.deviceCategory}</Typography>
                        <Typography variant="body2"><strong>Condition:</strong> {request.deviceCondition}</Typography>
                        <Typography variant="body2"><strong>Quantity:</strong> {request.quantity}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        {request.latitude && request.longitude ? (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Pickup Location:</Typography>
                                {isLoaded && (
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={{ lat: request.latitude, lng: request.longitude }}
                                        zoom={14}
                                    >
                                        <Marker position={{ lat: request.latitude, lng: request.longitude }} />
                                    </GoogleMap>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No GPS location provided.</Typography>
                        )}
                        
                        {request.photoPath && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle2" gutterBottom>Uploaded Image:</Typography>
                                <img 
                                    src={`http://localhost:8080${request.photoPath}`} 
                                    alt="Device" 
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} 
                                />
                            </Box>
                        )}
                    </Grid>
                </Grid>

                {request.status === 'PENDING_VERIFICATION' && isRejecting && (
                    <Box sx={{ mt: 3 }}>
                        <TextField 
                            fullWidth 
                            label="Rejection Reason" 
                            multiline 
                            rows={2} 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                        />
                    </Box>
                )}

                {request.status === 'APPROVED' && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">Assign Collector</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Collector Name" value={collectorName} onChange={(e) => setCollectorName(e.target.value)} size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Collector Phone" value={collectorPhone} onChange={(e) => setCollectorPhone(e.target.value)} size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Pickup Date" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Pickup Time" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Close</Button>
                {request.status === 'PENDING_VERIFICATION' && (
                    <>
                        {isRejecting ? (
                            <Button 
                                variant="contained" 
                                color="error" 
                                onClick={handleReject} 
                                disabled={!rejectionReason.trim() || loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Confirm Rejection'}
                            </Button>
                        ) : (
                            <Button variant="outlined" color="error" onClick={() => setIsRejecting(true)} disabled={loading}>
                                Reject
                            </Button>
                        )}
                        
                        {!isRejecting && (
                            <Button variant="contained" color="success" onClick={handleApprove} disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Approve'}
                            </Button>
                        )}
                    </>
                )}

                {request.status === 'APPROVED' && (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleAssignCollector} 
                        disabled={!collectorName || !collectorPhone || !pickupDate || !pickupTime || loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Assign Collector'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OfficeRequestDetailsModal;
