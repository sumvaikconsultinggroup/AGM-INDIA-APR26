export const API_Base_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const Accommodation_Types = {
    GANGA : 'ganga,',
    YAMUNA : 'yamuna',
    SARASWATI : 'saraswati',
};

export const PAYMENT_STATUS = {
    PENDING : 'pending',
    FAILED : 'failed',
    COMPLETED : 'completed',
};

export const BOOKING_STATUS = {
    PENDING : 'pending',
    CONFIRMED : 'confirmed',
    CANCELLED : 'cancelled',    
};
