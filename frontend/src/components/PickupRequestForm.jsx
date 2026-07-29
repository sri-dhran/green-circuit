import React, { useState } from 'react';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Alert } from '@mui/material';
import { pickupRequestService } from '../api/pickupRequestService';

const categories = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Accessories', 'Other'];
const conditions = ['New', 'Good', 'Fair', 'Poor', 'Broken'];

const PickupRequestForm = ({ office, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        deviceName: '',
        deviceCategory: '',
        quantity: 1,
        condition: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please upload a photo of the device.");
            return;
        }

        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('officeId', office.id);
        data.append('deviceName', formData.deviceName);
        data.append('deviceCategory', formData.deviceCategory);
        data.append('quantity', formData.quantity);
        data.append('condition', formData.condition);
        data.append('file', file);

        const sendData = async (lat, lng) => {
            if (lat) data.append('latitude', lat);
            if (lng) data.append('longitude', lng);
            
            try {
                await pickupRequestService.createRequest(data);
                onSuccess();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to submit pickup request.');
            } finally {
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => sendData(pos.coords.latitude, pos.coords.longitude),
                (err) => sendData(null, null)
            );
        } else {
            sendData(null, null);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Request Pickup from {office.officeName}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
                required
                fullWidth
                margin="normal"
                label="Device Name"
                name="deviceName"
                value={formData.deviceName}
                onChange={handleChange}
            />

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

            <Box sx={{ mt: 2, mb: 2 }}>
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Submit Request'}
                </Button>
            </Box>
        </Box>
    );
};

export default PickupRequestForm;
