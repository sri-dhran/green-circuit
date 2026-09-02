import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Button, TextField, Box, IconButton, Typography, CircularProgress,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { officeService } from '../api/officeService';

const OfficeList = ({ onEdit }) => {
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOffices();
    }, []);

    const fetchOffices = async () => {
        setLoading(true);
        try {
            const data = await officeService.getAllOffices();
            setOffices(data);
        } catch (error) {
            console.error("Error fetching offices:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (searchQuery.trim() === '') {
                fetchOffices();
            } else {
                const data = await officeService.searchOffices(searchQuery);
                setOffices(data);
            }
        } catch (error) {
            console.error("Error searching offices:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this office?")) {
            try {
                await officeService.deleteOffice(id);
                fetchOffices();
            } catch (error) {
                console.error("Error deleting office:", error);
            }
        }
    };

    return (
        <Box>
            <Box component="form" onSubmit={handleSearch} sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search offices by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" type="submit" color="primary">
                    Search
                </Button>
                <Button variant="outlined" onClick={fetchOffices}>
                    Reset
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="office table">
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Address</strong></TableCell>
                                <TableCell><strong>Phone Number</strong></TableCell>
                                <TableCell><strong>Working Hours</strong></TableCell>
                                <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {offices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                                            No offices found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                offices.map((office) => (
                                    <TableRow key={office.id} hover>
                                        <TableCell>{office.officeName}</TableCell>
                                        <TableCell>{office.address}</TableCell>
                                        <TableCell>{office.phoneNumber}</TableCell>
                                        <TableCell>{office.workingHours}</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => onEdit(office)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(office.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default OfficeList;
