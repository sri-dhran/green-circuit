import React, { useState, useEffect } from 'react';
import { Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { pickupRequestService } from '../api/pickupRequestService';

const getStatusColor = (status) => {
    switch(status) {
        case 'PENDING_VERIFICATION': return 'warning';
        case 'APPROVED': return 'success';
        case 'COLLECTOR_ASSIGNED': return 'info';
        case 'REJECTED': return 'error';
        case 'COMPLETED': return 'primary';
        default: return 'default';
    }
};

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
        } catch (err) {
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
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Device</strong></TableCell>
                            <TableCell><strong>Office</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id} hover>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{req.deviceName}</TableCell>
                                <TableCell>{req.office.officeName}</TableCell>
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
            <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Request Details</DialogTitle>
                <DialogContent dividers>
                    {selectedRequest && (
                        <Box>
                            <Typography variant="body1"><strong>Device:</strong> {selectedRequest.deviceName}</Typography>
                            <Typography variant="body1"><strong>Category:</strong> {selectedRequest.deviceCategory}</Typography>
                            <Typography variant="body1"><strong>Condition:</strong> {selectedRequest.deviceCondition}</Typography>
                            <Typography variant="body1"><strong>Quantity:</strong> {selectedRequest.quantity}</Typography>
                            <Typography variant="body1"><strong>Status:</strong> <Chip label={selectedRequest.status} color={getStatusColor(selectedRequest.status)} size="small" sx={{ ml: 1 }} /></Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}><strong>Office:</strong> {selectedRequest.office.officeName}</Typography>
                            
                            {(selectedRequest.status === 'COLLECTOR_ASSIGNED' || selectedRequest.status === 'COMPLETED') && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom><strong>Collector Details</strong></Typography>
                                    <Typography variant="body2"><strong>Name:</strong> {selectedRequest.collectorName}</Typography>
                                    <Typography variant="body2"><strong>Phone:</strong> {selectedRequest.collectorPhoneNumber}</Typography>
                                    <Typography variant="body2"><strong>Pickup Date:</strong> {selectedRequest.pickupDate}</Typography>
                                    <Typography variant="body2"><strong>Pickup Time:</strong> {selectedRequest.pickupTime}</Typography>
                                </Box>
                            )}
                            
                            {selectedRequest.photoPath && (
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography variant="subtitle2" gutterBottom>Attached Photo:</Typography>
                                    <img 
                                        src={`http://localhost:8080${selectedRequest.photoPath}`} 
                                        alt="Device" 
                                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} 
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedRequest(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PickupRequestHistory;
