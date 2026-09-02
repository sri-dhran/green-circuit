import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Grid, Typography, CircularProgress } from '@mui/material';
import { officeService } from '../api/officeService';

const OfficeForm = ({ office, onSuccess }) => {
    const [formData, setFormData] = useState({
        officeName: '',
        address: '',
        latitude: '',
        longitude: '',
        phoneNumber: '',
        workingHours: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (office) {
            setFormData({
                officeName: office.officeName || '',
                address: office.address || '',
                latitude: office.latitude || '',
                longitude: office.longitude || '',
                phoneNumber: office.phoneNumber || '',
                workingHours: office.workingHours || ''
            });
        }
    }, [office]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (office && office.id) {
                await officeService.updateOffice(office.id, formData);
            } else {
                await officeService.createOffice(formData);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save office. Please check the inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                {office ? 'Edit Office Details' : 'Add New Office'}
            </Typography>
            
            {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Office Name"
                        name="officeName"
                        value={formData.officeName}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Address"
                        name="address"
                        multiline
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Latitude"
                        name="latitude"
                        type="number"
                        inputProps={{ step: "any" }}
                        value={formData.latitude}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Longitude"
                        name="longitude"
                        type="number"
                        inputProps={{ step: "any" }}
                        value={formData.longitude}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Working Hours (e.g. 9 AM - 5 PM)"
                        name="workingHours"
                        value={formData.workingHours}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                    variant="outlined" 
                    onClick={() => onSuccess()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Save Office'}
                </Button>
            </Box>
        </Box>
    );
};

export default OfficeForm;
