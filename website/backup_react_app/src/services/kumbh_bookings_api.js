import axios from 'axios';
import { API_Base_URL } from '../config/kumbh_booking_contants';

const api = axios.create({
    baseURL: API_Base_URL,
    headers : {
        'Content-Type': 'application/json',
    }
});

export const createKumbhBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
}
export const getKumbhBookings = async (registrationId) => {
    try {
        const response = await api.get(`/bookings/${registrationId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
}


export const updateKumbhBooking = async (bookingId, bookingData) => {
    try {
        const response = await api.put(`/kumbh_bookings/${bookingId}`, bookingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update booking');
    }
}

export const deleteKumbhBooking = async (bookingId) => {
    try {
        const response = await api.delete(`/kumbh_bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const checkAvailability = async (params) => {    
    try {
        const response = await api.get(`/accomodations/availabilty`, { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
}