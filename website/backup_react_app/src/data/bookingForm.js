// Personal Details
const PersonalDetails = {
    firstName: '',
    middleName: '', // optional
    lastName: '',
    spiritualName: '', // optional
    gender: 'male', // or 'female', 'non-binary', 'prefer-not-to-say'
    dateOfBirth: '',
    nationality: ''
  };
  
  // Contact Details
  const ContactDetails = {
    primaryMobile: '',
    alternateMobile: '', // optional
    email: '',
    preferredCommunication: 'sms' // or 'email', 'phone'
  };
  
  // Address
  const Address = {
    street: '',
    city: '',
    state: '',
    pinCode: '',
    country: ''
  };
  
  // Accommodation Preference
  const AccommodationPreference = {
    kutiyaType: 'ganga', // or 'yamuna', 'saraswati'
    arrivalDate: '',
    departureDate: '',
    numberOfPersons: 0,
    proximityPreference: false,
    specialRequirements: '' // optional
  };
  
  // Group Member
  const GroupMember = {
    name: '',
    age: 0,
    gender: '',
    idProof: null // optional, can be a File object
  };
  
  // Emergency Contact
  const EmergencyContact = {
    name: '',
    relationship: '',
    contactNumber: ''
  };
  
  // Volunteering Preference
  const VolunteeringPreference = {
    isInterested: false,
    areas: [], // optional, can include 'food', 'crowd', 'medical', 'kutiya', 'other'
    otherArea: '' // optional
  };
  
  // Booking Form Data
  const BookingFormData = {
    personalDetails: PersonalDetails,
    contactDetails: ContactDetails,
    permanentAddress: Address,
    communicationAddress: Address,
    sameAsPermanent: false,
    accommodation: AccommodationPreference,
    isGroup: false,
    groupMembers: [], // optional, array of GroupMember objects
    idProof: {
      file: null, // File object
      number: ''
    },
    emergencyContact: EmergencyContact,
    volunteering: VolunteeringPreference,
    preferredPaymentMethod: '',
    comments: '', // optional
    termsAccepted: false
  };