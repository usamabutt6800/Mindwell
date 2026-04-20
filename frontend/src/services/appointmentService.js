import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create appointment';
    }
  },

  getAvailableSlots: async (date) => {
    try {
      const response = await api.get(`/appointments/available-slots?date=${date}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch available slots';
    }
  },

  getAppointments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/appointments?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch appointments';
    }
  },

  updateAppointment: async (id, updateData) => {
    try {
      const response = await api.put(`/appointments/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update appointment';
    }
  },

  deleteAppointment: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to delete appointment';
    }
  },
};