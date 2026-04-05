// export const validateField = (value, rules) => {
// if(rules.required && !value) return  'This field is required';

import { Accommodation_Types } from "../config/kumbh_booking_contants";

// if(rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';

// if(rules.phone && !/^[0-9]{10}$/.test(value)) return 'Invalid phone number';

// return null;
// };

// export const validateForm = (formData) => {
//   const errors = {};

//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors
//   };
//   };



export const validateField = (value, fieldName, rules = {}) => {
  if (rules.required && !value) {
    return `${fieldName} is required`;
  }

  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Invalid email format';
  }

  if (rules.phone && !/^[0-9]{10}$/.test(value)) {
    return 'Invalid phone number (10 digits required)';
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }

  return null;
};

export const validateForm = (formData) => {
  const errors = {};

  // Personal Details
  ['firstName', 'lastName', 'gender', 'dob', 'nationality'].forEach(field => {
    const error = validateField(formData[field], field, { required: true });
    if (error) errors[field] = error;
  });

  // Contact Details
  const emailError = validateField(formData.email, 'Email', { required: true, email: true });
  if (emailError) errors.email = emailError;

  const phoneError = validateField(formData.primaryMobile, 'Mobile number', { required: true, phone: true });
  if (phoneError) errors.primaryMobile = phoneError;

  // Accommodation
  if (!Object.values(Accommodation_Types).includes(formData.kutijaType)) {
    errors.kutijaType = 'Invalid accommodation type';
  }

  if (!formData.numberOfPersons || formData.numberOfPersons < 1) {
    errors.numberOfPersons = 'Number of persons is required';
  }

  if (!formData.arrivalDate || !formData.departureDate) {
    errors.dates = 'Both arrival and departure dates are required';
  }

  // Terms
  if (!formData.termsAccepted) {
    errors.terms = 'You must accept the terms and conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
  