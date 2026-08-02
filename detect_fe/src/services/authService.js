import { authApi } from '../api/authApi';

export const authService = {
  async updateProfile(data) {
    const { data: resp } = await authApi.updateProfile(data);
    return resp;
  },

  async changePassword(data) {
    const { data: resp } = await authApi.changePassword(data);
    return resp;
  },
};
