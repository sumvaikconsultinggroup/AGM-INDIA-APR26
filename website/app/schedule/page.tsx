import { Contact } from '@/components/sections/Contact';
import { Events } from '@/components/sections/Events';
import { ScheduleHero } from '@/components/sections/ScheduleHero';

export const metadata = {
  title: 'Schedule & Events | Swami Avdheshanand Giri Ji Maharaj',
  description: 'View upcoming satsangs, discourses, and spiritual events by Swami Avdheshanand Giri Ji Maharaj.',
};

export default function SchedulePage() {
  return (
    <div className="bg-parchment pt-20">
      <ScheduleHero />
      <Events />
      <Contact />
    </div>
  );
}
