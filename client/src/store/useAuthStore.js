import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const useAuthStore = create((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
  wishlist: [],
  isLoading: false,
  error: null,

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  login: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },

  // Call this from anywhere when a 401 is received
  handleAuthError: () => {
    localStorage.removeItem('user');
    set({ user: null, wishlist: [] });
  },

  fetchWishlist: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Assuming getWishlist endpoint returns populated array, or just IDs.
      // Actually backend returns populated wishlist, so response.data is an array of objects.
      set({ wishlist: response.data });
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    }
  },

  toggleWishlist: async (courseId) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;
      
      // Optimistic update
      set((state) => {
        const inWishlist = state.wishlist.some(c => c._id === courseId || c === courseId);
        if (inWishlist) {
          return { wishlist: state.wishlist.filter(c => c._id !== courseId && c !== courseId) };
        } else {
          return { wishlist: [...state.wishlist, { _id: courseId }] }; // Simple mock object until fetch completes
        }
      });

      const response = await axios.post(`${API_URL}/wishlist/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // We can refetch or rely on response if it returns the full list
      // Let's just refetch to get populated data
      useAuthStore.getState().fetchWishlist();
    } catch (error) {
      console.error('Failed to toggle wishlist', error);
    }
  },
}));

// Global axios interceptor — auto-clears stale token on 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || '';
    if (status === 401 && (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('authorized'))) {
      localStorage.removeItem('user');
      useAuthStore.setState({ user: null });
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default useAuthStore;
