import React, { useState, useEffect, useContext } from 'react';
import { Box, Container, Typography, AppBar, Toolbar, Button, Grid, Card, CardMedia, CardContent, CardActions, Chip, CircularProgress, Alert, Snackbar, Tabs, Tab, List, ListItem, ListItemText, Paper } from '@mui/material';
import { rewardService } from '../api/rewardService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const RewardStore = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [rewards, setRewards] = useState([]);
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rewardsData, redemptionsData] = await Promise.all([
                rewardService.getAvailableRewards(),
                rewardService.getMyRedemptions()
            ]);
            setRewards(rewardsData);
            setRedemptions(redemptionsData);
            if (refreshUser) refreshUser(); // refresh points
        } catch {
            setError('Failed to load store data');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (itemId) => {
        try {
            await rewardService.redeemReward(itemId);
            setSuccessMsg('Reward redeemed successfully!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to redeem reward. Not enough points?');
        }
    };

    const handleBack = () => {
        navigate('/user');
    };

    if (!user) return null;

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #ff9800 30%, #ffc107 90%)' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
                        Green Circuit - Rewards Store
                    </Typography>
                    <Chip 
                        icon={<EmojiEventsIcon />} 
                        label={`${user.rewardPoints} Points`} 
                        color="secondary" 
                        sx={{ mr: 3, fontWeight: 'bold' }} 
                    />
                    <Button color="inherit" onClick={handleBack} sx={{ color: 'white', mr: 2 }}>Back to Dashboard</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} centered>
                        <Tab label="Available Rewards" />
                        <Tab label="My Redemptions" />
                    </Tabs>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                
                <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
                        {successMsg}
                    </Alert>
                </Snackbar>

                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                ) : (
                    <>
                        {tabIndex === 0 && (
                            <Grid container spacing={3}>
                                {rewards.map(reward => (
                                    <Grid item xs={12} sm={6} md={4} key={reward.id}>
                                        <Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={reward.imageUrl}
                                                alt={reward.name}
                                            />
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography gutterBottom variant="h6" component="div" color="primary">
                                                    {reward.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {reward.description}
                                                </Typography>
                                                <Chip 
                                                    icon={<EmojiEventsIcon />} 
                                                    label={`${reward.pointsCost} Points`} 
                                                    color={user.rewardPoints >= reward.pointsCost ? "success" : "default"}
                                                    size="small"
                                                />
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Button 
                                                    fullWidth 
                                                    variant="contained" 
                                                    color="primary" 
                                                    disabled={user.rewardPoints < reward.pointsCost}
                                                    onClick={() => handleRedeem(reward.id)}
                                                >
                                                    {user.rewardPoints >= reward.pointsCost ? 'Redeem Now' : 'Not Enough Points'}
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {tabIndex === 1 && (
                            <Paper elevation={2} sx={{ p: 2 }}>
                                {redemptions.length === 0 ? (
                                    <Alert severity="info">You haven't redeemed any rewards yet.</Alert>
                                ) : (
                                    <List>
                                        {redemptions.map(r => (
                                            <ListItem key={r.id} divider>
                                                <ListItemText 
                                                    primary={<Typography variant="h6">{r.rewardItem.name}</Typography>}
                                                    secondary={`Redeemed on: ${new Date(r.redeemedAt).toLocaleString()}`} 
                                                />
                                                <Chip label={`Cost: ${r.rewardItem.pointsCost} Points`} size="small" />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default RewardStore;
