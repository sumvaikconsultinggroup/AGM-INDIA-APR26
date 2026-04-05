// dashboard-next/src/lib/panchang/muhurta.ts
import SunCalc from 'suncalc';
import {
  TimePeriod, ChoghadiyaPeriod,
  RAHU_KAAL_ORDER, YAMAGHANDA_ORDER, GULIKA_KAAL_ORDER,
  CHOGHADIYA_DAY_ORDER, CHOGHADIYA_NATURES,
} from './types';

/**
 * Get sunrise and sunset for a given date and location.
 */
export function getSunTimes(date: Date, lat: number, lng: number): { sunrise: Date; sunset: Date; solarNoon: Date } {
  const times = SunCalc.getTimes(date, lat, lng);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
  };
}

/**
 * Get moonrise and moonset for a given date and location.
 */
export function getMoonTimes(date: Date, lat: number, lng: number): { moonrise?: Date; moonset?: Date } {
  const times = SunCalc.getMoonTimes(date, lat, lng);
  return {
    moonrise: times.rise || undefined,
    moonset: times.set || undefined,
  };
}

/**
 * Calculate Rahu Kaal for a given day.
 * Divide daytime (sunrise to sunset) into 8 equal parts.
 * The Rahu Kaal period depends on the day of the week.
 * Sunday=8th, Monday=2nd, Tuesday=7th, Wednesday=5th,
 * Thursday=6th, Friday=4th, Saturday=3rd
 */
export function calculateRahuKaal(sunrise: Date, sunset: Date, dayOfWeek: number): TimePeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const segmentDuration = dayDuration / 8;
  const segment = RAHU_KAAL_ORDER[dayOfWeek]; // 1-indexed

  const start = new Date(sunrise.getTime() + (segment - 1) * segmentDuration);
  const end = new Date(start.getTime() + segmentDuration);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Yamaghanda for a given day.
 * Similar to Rahu Kaal but with different segment ordering.
 */
export function calculateYamaghanda(sunrise: Date, sunset: Date, dayOfWeek: number): TimePeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const segmentDuration = dayDuration / 8;
  const segment = YAMAGHANDA_ORDER[dayOfWeek];

  const start = new Date(sunrise.getTime() + (segment - 1) * segmentDuration);
  const end = new Date(start.getTime() + segmentDuration);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Gulika Kaal for a given day.
 */
export function calculateGulikaKaal(sunrise: Date, sunset: Date, dayOfWeek: number): TimePeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const segmentDuration = dayDuration / 8;
  const segment = GULIKA_KAAL_ORDER[dayOfWeek];

  const start = new Date(sunrise.getTime() + (segment - 1) * segmentDuration);
  const end = new Date(start.getTime() + segmentDuration);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Brahma Muhurta.
 * Brahma Muhurta = 96 minutes (2 muhurtas) before sunrise.
 * Each muhurta = 48 minutes.
 */
export function calculateBrahmaMuhurta(sunrise: Date): TimePeriod {
  const start = new Date(sunrise.getTime() - 96 * 60 * 1000); // 96 min before
  const end = new Date(sunrise.getTime() - 48 * 60 * 1000); // 48 min before

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Abhijit Muhurta.
 * Abhijit Muhurta = the period around local solar noon.
 * It spans 24 minutes before and 24 minutes after solar noon (1 muhurta = 48 min total).
 */
export function calculateAbhijitMuhurta(sunrise: Date, sunset: Date): TimePeriod {
  const solarNoonMs = sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2;
  const halfMuhurta = 24 * 60 * 1000; // 24 minutes

  const start = new Date(solarNoonMs - halfMuhurta);
  const end = new Date(solarNoonMs + halfMuhurta);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Calculate Choghadiya periods for a day.
 * 8 periods during daytime (sunrise to sunset) and 8 during nighttime (sunset to next sunrise).
 */
export function calculateChoghadiya(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  dayOfWeek: number
): { day: ChoghadiyaPeriod[]; night: ChoghadiyaPeriod[] } {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const nightDuration = nextSunrise.getTime() - sunset.getTime();

  const daySegment = dayDuration / 8;
  const nightSegment = nightDuration / 8;

  const dayOrder = CHOGHADIYA_DAY_ORDER[dayOfWeek] || CHOGHADIYA_DAY_ORDER[0];

  const dayPeriods: ChoghadiyaPeriod[] = dayOrder.map((name, i) => ({
    name,
    start: new Date(sunrise.getTime() + i * daySegment).toISOString(),
    end: new Date(sunrise.getTime() + (i + 1) * daySegment).toISOString(),
    nature: CHOGHADIYA_NATURES[name] || 'char',
  }));

  // Night choghadiya follows a shifted order
  const nightOrder = [
    ...dayOrder.slice(4),
    ...dayOrder.slice(0, 4),
  ];

  const nightPeriods: ChoghadiyaPeriod[] = nightOrder.map((name, i) => ({
    name,
    start: new Date(sunset.getTime() + i * nightSegment).toISOString(),
    end: new Date(sunset.getTime() + (i + 1) * nightSegment).toISOString(),
    nature: CHOGHADIYA_NATURES[name] || 'char',
  }));

  return { day: dayPeriods, night: nightPeriods };
}

/**
 * Format a Date to a time string like "05:42 AM"
 */
export function formatTime(date: Date, timezone: string = 'Asia/Kolkata'): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}
