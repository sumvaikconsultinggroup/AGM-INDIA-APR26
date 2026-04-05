export const generateRegistrationId = () => {
    const prefix = 'KMP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };
  
  export const calculateTotalCost = (accommodation, days, persons) => {
    let baseCost;
    switch (accommodation) {
      case 'ganga':
        baseCost = 7500;
        break;
      case 'yamuna':
        baseCost = persons <= 6 ? 9000 : (persons * 2000);
        break;
      case 'saraswati':
        baseCost = persons <= 12 ? 12000 : (persons * 1500);
        break;
      default:
        throw new Error('Invalid accommodation type');
    }
    return baseCost * days;
  };
  
  export const calculateDays = (startDate, endDate) => {
    return Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
  };