// export const generateRegistrationId = () => {
//     const prefix = 'KMP';
//     const timestamp = Date.now().toString().slice(-6);
//     const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//     return `${prefix}${timestamp}${random}`;
//   };
  
//   export const formatRegistrationData = (formData) => {
//     return {
//       registrationId: generateRegistrationId(),
//       totalCost: calculateTotalCost(formData),
//       personalDetails: {
//         name: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim(),
//         spiritualName: formData.spiritualName,
//         gender: formData.gender,
//         dob: formData.dob,
//         nationality: formData.nationality
//       },
//       contactDetails: {
//         mobile: formData.primaryMobile,
//         email: formData.email
//       },
//       accommodation: {
//         type: formData.kutijaType,
//         persons: formData.numberOfPersons,
//         arrival: formData.arrivalDate,
//         departure: formData.departureDate
//       }
//     };
//   };
  
//   const calculateTotalCost = (formData) => {
//     if (!formData.kutijaType || !formData.arrivalDate || !formData.departureDate || !formData.numberOfPersons) {
//       return 0;
//     }
  
//     const arrival = new Date(formData.arrivalDate);
//     const departure = new Date(formData.departureDate);
//     const days = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
  
//     let costPerDay = 0;
//     switch (formData.kutijaType) {
//       case 'ganga':
//         costPerDay = 7500;
//         break;
//       case 'yamuna':
//         costPerDay = formData.numberOfPersons <= 6 ? 9000 : (formData.numberOfPersons * 2000);
//         break;
//       case 'saraswati':
//         costPerDay = formData.numberOfPersons <= 12 ? 12000 : (formData.numberOfPersons * 1500);
//         break;
//       default:
//         costPerDay = 0;
//     }
  
//     return costPerDay * days;
//   };

import { generateRegistrationId } from './bookingUtils';

export const formatRegistrationData = (formData) => {
  return {
    registrationId: generateRegistrationId(),
    personalDetails: {
      firstName: formData.firstName,
      middleName: formData.middleName || '',
      lastName: formData.lastName,
      spiritualName: formData.spiritualName || '',
      gender: formData.gender,
      dob: formData.dob,
      nationality: formData.nationality
    },
    contactDetails: {
      primaryMobile: formData.primaryMobile,
      alternateMobile: formData.alternateMobile || '',
      email: formData.email,
      preferredCommunication: formData.preferredCommunication
    },
    address: {
      permanentAddress: formData.permanentAddress,
      communicationAddress: formData.sameAsPermament 
        ? formData.permanentAddress 
        : formData.communicationAddress
    },
    emergencyContact: {
      name: formData.emergencyContactName,
      relationship: formData.emergencyRelationship,
      contactNumber: formData.emergencyContactNumber
    },
    accommodation: {
      kutijaType: formData.kutijaType,
      numberOfPersons: parseInt(formData.numberOfPersons, 10),
      arrivalDate: formData.arrivalDate,
      departureDate: formData.departureDate,
      proximityPreference: formData.proximityPreference === 'yes',
      specialRequirements: formData.specialRequirements || ''
    },
    groupDetails: formData.isGroup === 'yes' ? {
      isGroup: true,
      members: formData.groupMembers.map(member => ({
        name: member.name,
        age: parseInt(member.age, 10),
        gender: member.gender,
        idProof: member.idFile ? member.idFile.name : null
      }))
    } : null,
    volunteering: formData.isVolunteer === 'yes' ? {
      isVolunteer: true,
      areas: formData.volunteerAreas,
      otherArea: formData.otherVolunteerArea || '',
      organizerComments: formData.organizerComments || ''
    } : null,
    verification: {
      primaryIdType: formData.primaryIdType,
      primaryIdNumber: formData.primaryIdNumber,
      primaryIdFile: formData.primaryIdFile ? formData.primaryIdFile.name : null
    }
  };
};

