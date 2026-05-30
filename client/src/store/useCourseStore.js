import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/courses`;

const useCourseStore = create((set) => ({
  courses: [],
  currentCourse: null,
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_URL);
      set({ courses: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  createCourse: async (courseData) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.post(API_URL, courseData, config);
      set((state) => ({ 
        courses: [...state.courses, response.data], 
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      const { user } = useAuthStore.getState();
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      set((state) => ({ courses: state.courses.filter(c => c._id !== id) }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}));

export default useCourseStore;
