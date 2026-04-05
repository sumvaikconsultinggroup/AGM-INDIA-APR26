import {
  Calendar,
  CalendarCheck,
  Command,
  MessageSquare,
  Book,
  Home,
  Users,
  ImageIcon,
  HeartHandshake,
  Newspaper,
  Heart,
  Globe,
  LucideIcon,
} from 'lucide-react';

export type ServiceId =
  | 'dashboard'
  | 'events'
  | 'donations'
  | 'schedule'
  | 'servicesManagement'
  | 'scheduleRegistrations'
  | 'connect'
  | 'books'
  | 'rooms'
  | 'users'
  | 'glimpse'
  | 'imagelibrary'
  | 'volunteers'
  | 'printMedia'
  | 'dikshaMantra'
  | 'dailySchedule'
  | 'website';

export interface ServiceItem {
  id: ServiceId;
  name: string;
  route: string; // leading slash route prefix to guard
  icon: LucideIcon;
}

// Single source of truth for services rendered in the app sidebar and guarded across routes
export const services: ServiceItem[] = [
  { id: 'events', name: 'Events', route: '/dashboard/events', icon: Calendar },
  { id: 'donations', name: 'Donations', route: '/dashboard/donationsRecord', icon: Calendar },
  { id: 'schedule', name: 'Schedule', route: '/dashboard/schedule', icon: Calendar },
  {
    id: 'servicesManagement',
    name: 'Services Management',
    route: '/dashboard/services',
    icon: Command,
  },
  {
    id: 'scheduleRegistrations',
    name: 'Schedule Registrations',
    route: '/dashboard/schedule-registrations',
    icon: CalendarCheck,
  },
  { id: 'connect', name: 'Connect', route: '/dashboard/connect', icon: MessageSquare },
  { id: 'books', name: 'Books', route: '/dashboard/books', icon: Book },
  { id: 'rooms', name: 'Rooms', route: '/dashboard/rooms', icon: Home },
  { id: 'users', name: 'Users', route: '/dashboard/users', icon: Users },
  { id: 'glimpse', name: 'Glimpse', route: '/dashboard/glimpse', icon: ImageIcon },
  { id: 'imagelibrary', name: 'Image Library', route: '/dashboard/imagelibrary', icon: ImageIcon },
  { id: 'volunteers', name: 'Volunteer', route: '/dashboard/volunteer', icon: HeartHandshake },
  { id: 'printMedia', name: 'Print Media', route: '/dashboard/print-media', icon: Newspaper },
  { id: 'dikshaMantra', name: 'Diksha Mantra', route: '/dashboard/mantra-diksha', icon: Heart },
  {
    id: 'dailySchedule',
    name: 'Daily Schedule',
    route: '/dashboard/daily-schedule',
    icon: Calendar,
  },
  { id: 'website', name: 'Website', route: '/dashboard/website', icon: Globe },
];

// Utility: find a service by a pathname
export function matchServiceByPath(pathname: string): ServiceItem | undefined {
  if (!pathname || pathname === '/') return undefined;
  // Sort longest route first to match nested prefixes correctly
  const sorted = [...services].sort((a, b) => b.route.length - a.route.length);
  return sorted.find(s => pathname.startsWith(s.route));
}
