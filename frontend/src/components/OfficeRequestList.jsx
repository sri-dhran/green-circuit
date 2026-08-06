import React, { useState, useEffect } from 'react';
import { Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip, CircularProgress, Alert, Button } from '@mui/material';
import { pickupRequestService } from '../api/pickupRequestService';
import OfficeRequestDetailsModal from './OfficeRequestDetailsModal';

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

const OfficeRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        try {
            const data = await pickupRequestService.getOfficeRequests();
            setRequests(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch requests.');
        } finally {
            setLoading(false);
        }
    };

    // Auto refresh every 30 seconds
    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleActionComplete = () => {
        setSelectedRequest(null);
        fetchRequests();
    };

    if (loading && requests.length === 0) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    if (error && requests.length === 0) return <Alert severity="error">{error}</Alert>;
    if (requests.length === 0) return <Alert severity="info">No pickup requests found.</Alert>;

    return (
        <Box>
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Device</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id} hover>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{req.user.name}</TableCell>
                                <TableCell>{req.deviceName}</TableCell>
                                <TableCell>
                                    <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Button size="small" variant="contained" onClick={() => setSelectedRequest(req)}>
                                        Verify
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedRequest && (
                <OfficeRequestDetailsModal 
                    request={selectedRequest}
                    open={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onActionComplete={handleActionComplete}
                />
            )}
        </Box>
    );
};

export default OfficeRequestList;
