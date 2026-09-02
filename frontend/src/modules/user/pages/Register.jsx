import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert, MenuItem, Select, InputLabel, FormControl, Link } from '@mui/material';
import { officeService } from '../../center/api/officeService';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [officeId, setOfficeId] = useState('');
    
    const [offices, setOffices] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role === 'OFFICE') {
            const fetchOffices = async () => {
                try {
                    const data = await officeService.getAllOffices();
                    setOffices(data);
                } catch {
                    setError('Failed to fetch offices');
                }
            };
            fetchOffices();
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (role === 'OFFICE' && !officeId) {
            setError('Please select an office');
            return;
        }
        
        setLoading(true);
        
        try {
            const userData = await register(name, email, password, role, role === 'OFFICE' ? officeId : undefined);
            if (userData.role === 'OFFICE') {
                navigate('/dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed. Please verify backend server is running.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                    Sign Up
                </Typography>
                
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            id="role"
                            value={role}
                            label="Role"
                            onChange={(e) => {
                                setRole(e.target.value);
                                setOfficeId('');
                            }}
                        >
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="OFFICE">Office Admin</MenuItem>
                        </Select>
                    </FormControl>
                    
                    {role === 'OFFICE' && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="office-label">Select Office</InputLabel>
                            <Select
                                labelId="office-label"
                                id="officeId"
                                value={officeId}
                                label="Select Office"
                                onChange={(e) => setOfficeId(e.target.value)}
                            >
                                {offices.map((o) => (
                                    <MenuItem key={o.id} value={o.id}>{o.officeName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link component={RouterLink} to="/login" variant="body2">
                            Already have an account? Sign in
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
