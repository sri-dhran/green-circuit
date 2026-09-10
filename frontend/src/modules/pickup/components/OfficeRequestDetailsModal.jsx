import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, CircularProgress, Chip, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { pickupRequestService } from '../api/pickupRequestService';

const containerStyle = {
    width: '100%',
    height: '250px',
    borderRadius: '8px'
};

const OfficeRequestDetailsModal = ({ request, open, onClose, onActionComplete }) => {
    const [responseMsg, setResponseMsg] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [loading, setLoading] = useState(false);

    // For Scheduling Pickup
    const [collectorName, setCollectorName] = useState('');
    const [collectorPhone, setCollectorPhone] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    // For subsequent statuses
    const [nextStatus, setNextStatus] = useState('');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const handleAccept = async () => {
        setLoading(true);
        try {
            await pickupRequestService.acceptRequest(request.id, responseMsg);
            onActionComplete();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!responseMsg.trim()) return;
        setLoading(true);
        try {
            await pickupRequestService.rejectRequest(request.id, responseMsg);
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

    const handleUpdateStatus = async () => {
        if (!nextStatus) return;
        setLoading(true);
        try {
            await pickupRequestService.updateRequestStatus(request.id, nextStatus);
            onActionComplete();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Collection Request (REQ-{request.id})</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom color="primary">User Details</Typography>
                        <Typography variant="body2"><strong>Name:</strong> {request.user.name}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {request.user.email}</Typography>
                        
                        <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>E-Waste Details</Typography>
                        <Typography variant="body2"><strong>Device:</strong> {request.deviceName}</Typography>
                        <Typography variant="body2"><strong>Category:</strong> {request.deviceCategory}</Typography>
                        <Typography variant="body2"><strong>Brand/Model:</strong> {request.brand || 'N/A'} / {request.model || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Description:</strong> {request.description}</Typography>
                        <Typography variant="body2"><strong>Quantity:</strong> {request.quantity}</Typography>
                        {request.approximateWeight && (
                            <Typography variant="body2"><strong>Weight:</strong> {request.approximateWeight} kg</Typography>
                        )}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Status:</strong> <Chip label={request.status} size="small" />
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Pickup Location:</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>{request.userLocation || 'Address not provided'}</Typography>
                            {request.latitude && request.longitude && isLoaded && (
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={{ lat: request.latitude, lng: request.longitude }}
                                    zoom={14}
                                >
                                    <Marker position={{ lat: request.latitude, lng: request.longitude }} />
                                </GoogleMap>
                            )}
                        </Box>
                        
                        {request.photoPath && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle2" gutterBottom>E-Waste Photo:</Typography>
                                <img 
                                    src={`http://localhost:8080${request.photoPath}`} 
                                    alt="E-Waste" 
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ccc' }} 
                                />
                            </Box>
                        )}
                    </Grid>
                </Grid>

                {request.status === 'PENDING' && isRejecting && (
                    <Box sx={{ mt: 3 }}>
                        <TextField 
                            fullWidth 
                            label="Rejection Reason (Optional)" 
                            multiline 
                            rows={2} 
                            value={responseMsg}
                            onChange={(e) => setResponseMsg(e.target.value)}
                        />
                    </Box>
                )}

                {request.status === 'ACCEPTED' && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">Schedule Pickup</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Collector Name" value={collectorName} onChange={(e) => setCollectorName(e.target.value)} size="small" required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Collector Phone" value={collectorPhone} onChange={(e) => setCollectorPhone(e.target.value)} size="small" required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Pickup Date" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Pickup Time" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} InputLabelProps={{ shrink: true }} size="small" required />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {(request.status === 'PICKUP_SCHEDULED' || request.status === 'COLLECTED') && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">Update Status</Typography>
                        <Box display="flex" gap={2} alignItems="center">
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Next Status</InputLabel>
                                <Select
                                    value={nextStatus}
                                    label="Next Status"
                                    onChange={(e) => setNextStatus(e.target.value)}
                                >
                                    {request.status === 'PICKUP_SCHEDULED' && <MenuItem value="COLLECTED">Collected</MenuItem>}
                                    {request.status === 'COLLECTED' && <MenuItem value="RECYCLED">Recycled</MenuItem>}
                                </Select>
                            </FormControl>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleUpdateStatus} 
                                disabled={!nextStatus || loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Update'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Close</Button>
                {request.status === 'PENDING' && (
                    <>
                        {isRejecting ? (
                            <Button 
                                variant="contained" 
                                color="error" 
                                onClick={handleReject} 
                                disabled={!responseMsg.trim() || loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Confirm Rejection'}
                            </Button>
                        ) : (
                            <Button variant="outlined" color="error" onClick={() => setIsRejecting(true)} disabled={loading}>
                                Reject Request
                            </Button>
                        )}
                        
                        {!isRejecting && (
                            <Button variant="contained" color="success" onClick={handleAccept} disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Accept Request'}
                            </Button>
                        )}
                    </>
                )}

                {request.status === 'ACCEPTED' && (
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={handleAssignCollector} 
                        disabled={!collectorName || !collectorPhone || !pickupDate || !pickupTime || loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Schedule Pickup'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OfficeRequestDetailsModal;
