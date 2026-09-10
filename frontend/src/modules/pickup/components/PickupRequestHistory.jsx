import React, { useState, useEffect } from 'react';
import { Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel } from '@mui/material';
import { pickupRequestService } from '../api/pickupRequestService';

const getStatusColor = (status) => {
    switch(status) {
        case 'PENDING': return 'warning';
        case 'ACCEPTED': return 'info';
        case 'REJECTED': return 'error';
        case 'PICKUP_SCHEDULED': return 'primary';
        case 'COLLECTED': return 'secondary';
        case 'RECYCLED': return 'success';
        case 'CANCELLED': return 'default';
        default: return 'default';
    }
};

const getStatusStep = (status) => {
    switch(status) {
        case 'PENDING': return 0;
        case 'ACCEPTED': return 1;
        case 'PICKUP_SCHEDULED': return 2;
        case 'COLLECTED': return 3;
        case 'RECYCLED': return 4;
        case 'REJECTED': return 1; // Special case
        case 'CANCELLED': return 0;
        default: return 0;
    }
};

const steps = ['Request Submitted', 'Collector Accepted', 'Pickup Scheduled', 'E-Waste Collected', 'Recycled'];

const PickupRequestHistory = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await pickupRequestService.getMyRequests();
            setRequests(data);
        } catch {
            setError('Failed to fetch request history.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (requests.length === 0) return <Alert severity="info">You have no pickup requests.</Alert>;

    return (
        <Box>
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Request ID</strong></TableCell>
                            <TableCell><strong>Photo</strong></TableCell>
                            <TableCell><strong>Device</strong></TableCell>
                            <TableCell><strong>Selected Collector</strong></TableCell>
                            <TableCell><strong>Requested Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id} hover>
                                <TableCell>REQ-{req.id}</TableCell>
                                <TableCell>
                                    {req.photoPath ? (
                                        <img src={`http://localhost:8080${req.photoPath}`} alt="Device" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : 'No Photo'}
                                </TableCell>
                                <TableCell>{req.brand} {req.model} ({req.deviceName})</TableCell>
                                <TableCell>{req.office.officeName}</TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" onClick={() => setSelectedRequest(req)}>
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Request Details Modal */}
            <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="md" fullWidth>
                <DialogTitle>Request Details (REQ-{selectedRequest?.id})</DialogTitle>
                <DialogContent dividers>
                    {selectedRequest && (
                        <Box>
                            {/* Status Timeline */}
                            <Box sx={{ width: '100%', mb: 4, mt: 2 }}>
                                {selectedRequest.status === 'REJECTED' || selectedRequest.status === 'CANCELLED' ? (
                                    <Alert severity="error">
                                        Request was {selectedRequest.status}.
                                        {selectedRequest.collectorResponse && ` Reason: ${selectedRequest.collectorResponse}`}
                                    </Alert>
                                ) : (
                                    <Stepper activeStep={getStatusStep(selectedRequest.status)} alternativeLabel>
                                        {steps.map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                )}
                            </Box>

                            <Box display="flex" gap={4} flexWrap="wrap">
                                <Box flex={1} minWidth="300px">
                                    <Typography variant="h6" gutterBottom color="primary">Device Details</Typography>
                                    <Typography variant="body2"><strong>Name:</strong> {selectedRequest.deviceName}</Typography>
                                    <Typography variant="body2"><strong>Category:</strong> {selectedRequest.deviceCategory}</Typography>
                                    <Typography variant="body2"><strong>Brand/Model:</strong> {selectedRequest.brand} / {selectedRequest.model}</Typography>
                                    <Typography variant="body2"><strong>Description:</strong> {selectedRequest.description}</Typography>
                                    <Typography variant="body2"><strong>Quantity:</strong> {selectedRequest.quantity}</Typography>
                                    {selectedRequest.approximateWeight && (
                                        <Typography variant="body2"><strong>Weight:</strong> {selectedRequest.approximateWeight} kg</Typography>
                                    )}
                                    <Typography variant="body2"><strong>Location:</strong> {selectedRequest.userLocation}</Typography>
                                    
                                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Collector Details</Typography>
                                    <Typography variant="body2"><strong>Center:</strong> {selectedRequest.office.officeName}</Typography>
                                    <Typography variant="body2"><strong>Address:</strong> {selectedRequest.office.address}</Typography>
                                    
                                    {(selectedRequest.status === 'PICKUP_SCHEDULED' || selectedRequest.status === 'COLLECTED') && (
                                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" color="primary" gutterBottom><strong>Scheduled Pickup</strong></Typography>
                                            <Typography variant="body2"><strong>Agent:</strong> {selectedRequest.collectorName}</Typography>
                                            <Typography variant="body2"><strong>Phone:</strong> {selectedRequest.collectorPhoneNumber}</Typography>
                                            <Typography variant="body2"><strong>Date:</strong> {selectedRequest.pickupDate}</Typography>
                                            <Typography variant="body2"><strong>Time:</strong> {selectedRequest.pickupTime}</Typography>
                                        </Box>
                                    )}
                                </Box>
                                
                                <Box flex={1} minWidth="250px" display="flex" flexDirection="column" alignItems="center">
                                    <Typography variant="h6" gutterBottom color="primary">E-Waste Photo</Typography>
                                    {selectedRequest.photoPath ? (
                                        <img 
                                            src={`http://localhost:8080${selectedRequest.photoPath}`} 
                                            alt="Device" 
                                            style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: '1px solid #ddd' }} 
                                        />
                                    ) : (
                                        <Typography color="text.secondary">No photo attached.</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedRequest(null)} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PickupRequestHistory;
