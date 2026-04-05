import {useState, useCallback} from 'react';
import { validateForm } from '../utils/vaildation';
import {formatRegistrationData} from '../utils/registration';
import { createKumbhBooking } from '../services/kumbh_bookings_api';

export const useBookingForm = () => {
    const initialFormState = {
        // Personal Details
        firstName: '',
        middleName: '',
        lastName: '',
        spiritualName: '',
        gender: '',
        dob: '',
        nationality: '',
        
        // Contact Details
        primaryMobile: '',
        alternateMobile: '',
        email: '',
        preferredCommunication: '',
        
        // Address
        permanentAddress: '',
        communicationAddress: '',
        sameAsPermament: false,
        
        // Emergency Contact
        emergencyContactName: '',
        emergencyRelationship: '',
        emergencyContactNumber: '',
        
        // Accommodation
        kutijaType: '',
        numberOfPersons: '',
        arrivalDate: '',
        departureDate: '',
        proximityPreference: '',
        specialRequirements: '',
        
        // Group Details
        isGroup: 'no',
        groupMembers: [],
        
        // Volunteering
        isVolunteer: 'no',
        volunteerAreas: [],
        otherVolunteerArea: '',
        organizerComments: '',
        
        // Verification
        primaryIdType: '',
        primaryIdNumber: '',
        primaryIdFile: null,
        termsAccepted: false
      };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    // const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [isSubmitted, setIsSubmitted] = useState(false);
    // const [registrationId, setRegistrationId] = useState(null);

    

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const validation = validateForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        setIsSubmitting(true);

        try {
            const formatted = formatRegistrationData(formData);
            const response = await createKumbhBooking(formatted);
            setErrors({});
            return response;
        } catch (error) {
            setErrors({submit: error.message});
        } finally {
            setIsSubmitting(false);
        }
    }, [formData]);

    return {
        formData,
        setFormData,
        errors,
        isSubmitting,
        handleSubmit,
    };
}