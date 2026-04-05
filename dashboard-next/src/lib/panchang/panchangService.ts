import citiesData from '@/data/cities.json';
import { getMoonLongitude, getMoonSunAngle, getSunLongitude } from '@/lib/panchang/astronomy';
import { calculateAyana, calculateHinduMonth, calculateKarana, calculateNakshatra, calculateRitu, calculateShakaSamvat, calculateTithi, calculateVikramSamvat, calculateYoga } from '@/lib/panchang/calculator';
import { findFestivals } from '@/lib/panchang/festivals';
import {
  calculateAbhijitMuhurta,
  calculateBrahmaMuhurta,
  calculateChoghadiya,
  calculateGulikaKaal,
  calculateRahuKaal,
  calculateYamaghanda,
  formatTime,
  getMoonTimes,
  getSunTimes,
} from '@/lib/panchang/muhurta';
import { EKADASHI_NAMES } from '@/lib/panchang/types';

interface CityEntry {
  name: string;
  timezone?: string;
}

interface BuildPanchangArgs {
  date: Date;
  lat: number;
  lng: number;
  cityName: string;
  timezone: string;
}

function timeZoneParts(date: Date, timeZone: string): Record<string, string> {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = timeZoneParts(date, timeZone);
  const asUtcTs = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtcTs - date.getTime();
}

function zonedDateToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  let adjusted = utcGuess - timeZoneOffsetMs(new Date(utcGuess), timeZone);

  // Re-apply once to handle DST transitions around the selected local time.
  adjusted = utcGuess - timeZoneOffsetMs(new Date(adjusted), timeZone);
  return new Date(adjusted);
}

export function formatDateKey(date: Date, timezone: string): string {
  const parts = timeZoneParts(date, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatTime24(date: Date, timezone: string): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  });
}

export function resolveTimezone(cityName?: string, tzParam?: string | null): string {
  if (tzParam) return tzParam;
  if (!cityName) return 'Asia/Kolkata';

  const cityMatch = (citiesData as CityEntry[]).find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );
  return cityMatch?.timezone || 'Asia/Kolkata';
}

export function buildObservationDate(dateStr: string | null, timezone: string): Date {
  if (!dateStr) return new Date();

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return new Date('invalid');

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return zonedDateToUtc(year, month, day, 6, 0, 0, timezone);
}

export function buildPanchangData({
  date,
  lat,
  lng,
  cityName,
  timezone,
}: BuildPanchangArgs) {
  const dateKey = formatDateKey(date, timezone);
  const sunTimes = getSunTimes(date, lat, lng);
  const moonTimes = getMoonTimes(date, lat, lng);
  const nextDaySunrise = getSunTimes(
    new Date(date.getTime() + 24 * 60 * 60 * 1000),
    lat,
    lng
  ).sunrise;

  const tithi = calculateTithi(date);
  const nakshatra = calculateNakshatra(date);
  const yoga = calculateYoga(date);
  const karana = calculateKarana(tithi.number);
  const hinduMonth = calculateHinduMonth(date);
  const angleWithinTithi = getMoonSunAngle(date) % 12;
  const currentKaranaHalf: 'first' | 'second' = angleWithinTithi < 6 ? 'first' : 'second';
  const currentKaranaName = currentKaranaHalf === 'first' ? karana.first : karana.second;

  const dayOfWeek = date.getDay();
  const rahuKaal = calculateRahuKaal(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);
  const yamaghanda = calculateYamaghanda(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);
  const gulikaKaal = calculateGulikaKaal(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);
  const brahmaMuhurta = calculateBrahmaMuhurta(sunTimes.sunrise);
  const abhijitMuhurta = calculateAbhijitMuhurta(sunTimes.sunrise, sunTimes.sunset);
  const choghadiya = calculateChoghadiya(sunTimes.sunrise, sunTimes.sunset, nextDaySunrise, dayOfWeek);

  const formatPeriod = (period: { start: string; end: string }) => ({
    start: formatTime24(new Date(period.start), timezone),
    end: formatTime24(new Date(period.end), timezone),
    startIso: period.start,
    endIso: period.end,
  });

  const festivals = findFestivals(date, tithi, hinduMonth);

  const isEkadashi = tithi.number === 11 || tithi.number === 26;
  let ekadashi = undefined;
  if (isEkadashi && EKADASHI_NAMES[hinduMonth]) {
    const ekadashiData = EKADASHI_NAMES[hinduMonth];
    const ekadashiName = tithi.paksha === 'Shukla' ? ekadashiData.shukla : ekadashiData.krishna;
    ekadashi = {
      name: ekadashiName,
      significance: 'Fast dedicated to Lord Vishnu. Break fast the next morning after sunrise.',
    };
  }

  const vratDays: string[] = [];
  if (isEkadashi) vratDays.push('Ekadashi Vrat');
  if (tithi.number === 13) vratDays.push('Pradosh Vrat');
  if (tithi.number === 4 && tithi.paksha === 'Krishna') vratDays.push('Sankashti Chaturthi');
  if (tithi.number === 14 && tithi.paksha === 'Krishna') vratDays.push('Shivaratri');

  return {
    date: dateKey,
    locationName: cityName,
    lat,
    lng,
    tithi: {
      ...tithi,
      startTime: formatTime24(new Date(tithi.startTime), timezone),
      endTime: formatTime24(new Date(tithi.endTime), timezone),
      startTimeIso: tithi.startTime,
      endTimeIso: tithi.endTime,
    },
    nakshatra: {
      ...nakshatra,
      startTime: formatTime24(new Date(nakshatra.startTime), timezone),
      endTime: formatTime24(new Date(nakshatra.endTime), timezone),
      startTimeIso: nakshatra.startTime,
      endTimeIso: nakshatra.endTime,
    },
    yoga,
    karana: {
      ...karana,
      name: currentKaranaName,
      currentHalf: currentKaranaHalf,
    },
    sunrise: formatTime24(sunTimes.sunrise, timezone),
    sunset: formatTime24(sunTimes.sunset, timezone),
    moonrise: moonTimes.moonrise ? formatTime24(moonTimes.moonrise, timezone) : 'N/A',
    moonset: moonTimes.moonset ? formatTime24(moonTimes.moonset, timezone) : 'N/A',
    rahuKaal: formatPeriod(rahuKaal),
    yamaghanda: formatPeriod(yamaghanda),
    gulikaKaal: formatPeriod(gulikaKaal),
    brahmaMuhurta: formatPeriod(brahmaMuhurta),
    abhijitMuhurta: formatPeriod(abhijitMuhurta),
    muhurta: {
      brahmaMuhurta: formatPeriod(brahmaMuhurta),
      abhijitMuhurta: formatPeriod(abhijitMuhurta),
      rahuKaal: formatPeriod(rahuKaal),
      yamaghanda: formatPeriod(yamaghanda),
      gulikaKaal: formatPeriod(gulikaKaal),
    },
    hinduMonth,
    paksha: tithi.paksha,
    vikramSamvat: calculateVikramSamvat(date),
    samvatYear: calculateVikramSamvat(date),
    shakaSamvat: calculateShakaSamvat(date),
    ritu: calculateRitu(hinduMonth),
    ayana: calculateAyana(date),
    choghadiya: {
      day: choghadiya.day.map((period) => ({
        ...period,
        start: formatTime24(new Date(period.start), timezone),
        end: formatTime24(new Date(period.end), timezone),
        startIso: period.start,
        endIso: period.end,
      })),
      night: choghadiya.night.map((period) => ({
        ...period,
        start: formatTime24(new Date(period.start), timezone),
        end: formatTime24(new Date(period.end), timezone),
        startIso: period.start,
        endIso: period.end,
      })),
    },
    festivals,
    festival: festivals[0] || null,
    ekadashi,
    isPurnima: tithi.number === 15,
    isAmavasya: tithi.number === 30,
    vratDays,
    sunLongitude: getSunLongitude(date),
    moonLongitude: getMoonLongitude(date),
    timezone,
    generatedAtIso: date.toISOString(),
    sunriseDisplay: formatTime(sunTimes.sunrise, timezone),
    sunsetDisplay: formatTime(sunTimes.sunset, timezone),
  };
}
