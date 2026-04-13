import { create } from 'zustand';

export const authStore = create((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  apiKey: localStorage.getItem('apiKey'),
  apiSecret: localStorage.getItem('apiSecret'),
  setAuth: ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  setApiCredentials: ({ apiKey, apiSecret }) => {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('apiSecret', apiSecret);
    set({ apiKey, apiSecret });
  },
  logout: () => {
    localStorage.clear();
    set({ token: null, user: null, apiKey: null, apiSecret: null });
  },
}));
