import api from '../../../common/api/axiosConfig';

export const rewardService = {
    getAvailableRewards: async () => {
        const response = await api.get('/rewards');
        return response.data;
    },

    getMyRedemptions: async () => {
        const response = await api.get('/rewards/me');
        return response.data;
    },

    redeemReward: async (itemId) => {
        const response = await api.post(`/rewards/redeem/${itemId}`);
        return response.data;
    }
};
