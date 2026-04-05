import { Events } from '@/components/sections/Events';
import { Contact } from '@/components/sections/Contact';
import { ScheduleHero } from '@/components/sections/ScheduleHero';

export const metadata = {
  title: 'Schedule & Events | Swami Avdheshanand Giri Ji Maharaj',
  description: 'View upcoming satsangs, discourses, and spiritual events by Swami Avdheshanand Giri Ji Maharaj.',
};

export default function SchedulePage() {
  return (
    <div className="pt-20">
      {/* Spiritual Hero Banner */}
      <ScheduleHero />
      
      <div className="divider-rangoli" />
      
      <div className="bg-temple-warm">
        <Events />
      </div>
      
      <div className="divider-rangoli" />
      
      <Contact />
    </div>
  );
}
