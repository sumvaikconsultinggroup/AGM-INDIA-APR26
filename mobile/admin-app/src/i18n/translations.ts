export type LanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as';

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },
];

const english = {
  common: {
    language: 'Language',
    logout: 'Logout',
    admin: 'Admin',
    role: 'Role',
    error: 'Error',
    comingSoon: 'Coming Soon',
  },
  auth: {
    title: 'Admin Dashboard',
    subtitle: 'Swami Avdheshanand Mission',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign In',
    fillAllFields: 'Please fill in all fields',
    loginFailed: 'Login Failed',
    invalidCredentials: 'Invalid credentials',
  },
  tabs: {
    dashboard: 'Dashboard',
    events: 'Events',
    donations: 'Donations',
    content: 'Content',
    more: 'More',
    schedule: 'Schedule',
  },
  admin: {
    allSections: 'All Sections',
    users: 'Users',
    events: 'Events',
    donations: 'Donations',
    volunteers: 'Volunteers',
    books: 'Books',
    articles: 'Articles',
    videos: 'Videos',
    podcasts: 'Podcasts',
    rooms: 'Rooms',
    quickActions: 'Quick Actions',
    appointments: 'Appointments',
    newEvent: 'New Event',
    newArticle: 'New Article',
    messages: 'Messages',
    bookings: 'Bookings',
    welcome: 'Hari Om, {{name}}',
    roleLabel: 'Role: {{role}}',
    openSection: 'Open {{section}} section',
    statUsers: 'Users',
    statEvents: 'Events',
    statDonations: 'Donations',
    statVolunteers: 'Volunteers',
    statBooks: 'Books',
    statArticles: 'Articles',
    featureComingSoon: '{{item}} will be available soon.',
  },
};

const hindi = {
  common: {
    language: 'भाषा',
    logout: 'लॉगआउट',
    admin: 'एडमिन',
    role: 'भूमिका',
    error: 'त्रुटि',
    comingSoon: 'जल्द आ रहा है',
  },
  auth: {
    title: 'एडमिन डैशबोर्ड',
    subtitle: 'स्वामी अवधेशानंद मिशन',
    username: 'यूज़रनेम',
    password: 'पासवर्ड',
    signIn: 'साइन इन',
    fillAllFields: 'कृपया सभी फ़ील्ड भरें',
    loginFailed: 'लॉगिन विफल',
    invalidCredentials: 'अमान्य क्रेडेंशियल्स',
  },
  tabs: {
    dashboard: 'डैशबोर्ड',
    events: 'कार्यक्रम',
    donations: 'दान',
    content: 'सामग्री',
    more: 'और',
    schedule: 'कार्यक्रम',
  },
  admin: {
    allSections: 'सभी अनुभाग',
    users: 'उपयोगकर्ता',
    events: 'कार्यक्रम',
    donations: 'दान',
    volunteers: 'सेवक',
    books: 'पुस्तकें',
    articles: 'लेख',
    videos: 'वीडियो',
    podcasts: 'पॉडकास्ट',
    rooms: 'कक्ष',
    quickActions: 'त्वरित क्रियाएँ',
    appointments: 'मुलाकात अनुरोध',
    newEvent: 'नया कार्यक्रम',
    newArticle: 'नया लेख',
    messages: 'संदेश',
    bookings: 'बुकिंग',
    welcome: 'हरि ॐ, {{name}}',
    roleLabel: 'भूमिका: {{role}}',
    openSection: '{{section}} अनुभाग खोलें',
    statUsers: 'उपयोगकर्ता',
    statEvents: 'कार्यक्रम',
    statDonations: 'दान',
    statVolunteers: 'सेवक',
    statBooks: 'पुस्तकें',
    statArticles: 'लेख',
    featureComingSoon: '{{item}} जल्द उपलब्ध होगा।',
  },
};

export const translations: Record<LanguageCode, typeof english> = {
  en: english,
  hi: hindi,
  bn: english,
  ta: english,
  te: english,
  mr: english,
  gu: english,
  kn: english,
  ml: english,
  pa: english,
  or: english,
  as: english,
};
