// dashboard-next/src/lib/panchang/festivals.ts
import { TithiInfo } from './types';
import festivalsData from '../../data/festivals.json';

interface FestivalEntry {
  nameEnglish: string;
  nameHindi: string;
  type: string;
  month?: string;
  tithiNumber?: number;
  paksha?: string;
  gregorianMonth?: number;
  gregorianDay?: number;
  region?: string[];
  description?: string;
}

/**
 * Find festivals matching a given date and tithi.
 * Matches on:
 * 1. Tithi-based festivals (Hindu month + tithi number + paksha)
 * 2. Fixed Gregorian date festivals (month + day)
 */
export function findFestivals(
  date: Date,
  tithi: TithiInfo,
  hinduMonth: string
): string[] {
  const festivals: string[] = [];
  const gMonth = date.getMonth() + 1; // 1-indexed
  const gDay = date.getDate();

  for (const festival of festivalsData as FestivalEntry[]) {
    // Match Gregorian fixed dates
    if (festival.gregorianMonth && festival.gregorianDay) {
      if (festival.gregorianMonth === gMonth && festival.gregorianDay === gDay) {
        festivals.push(festival.nameEnglish);
        continue;
      }
    }

    // Match tithi-based festivals
    if (festival.month && festival.tithiNumber && festival.paksha) {
      if (
        festival.month === hinduMonth &&
        festival.tithiNumber === tithi.number &&
        festival.paksha === tithi.paksha
      ) {
        festivals.push(festival.nameEnglish);
        continue;
      }
    }

    // Match monthly recurring festivals (e.g., monthly Ekadashi, Chaturthi, Pradosh)
    if (!festival.month && festival.tithiNumber && festival.paksha) {
      if (
        festival.tithiNumber === tithi.number &&
        festival.paksha === tithi.paksha
      ) {
        festivals.push(festival.nameEnglish);
      }
    }
  }

  return [...new Set(festivals)]; // Deduplicate
}

/**
 * Get upcoming festivals from a given date.
 * Returns the next N festivals sorted by date.
 */
export function getUpcomingFixedFestivals(fromDate: Date, count: number = 20): { name: string; date: string; description: string }[] {
  const results: { name: string; date: string; description: string }[] = [];
  const year = fromDate.getFullYear();

  for (const festival of festivalsData as FestivalEntry[]) {
    if (festival.gregorianMonth && festival.gregorianDay) {
      // Check this year and next year
      for (const y of [year, year + 1]) {
        const festDate = new Date(y, festival.gregorianMonth - 1, festival.gregorianDay);
        if (festDate >= fromDate) {
          results.push({
            name: festival.nameEnglish,
            date: festDate.toISOString().split('T')[0],
            description: festival.description || '',
          });
        }
      }
    }
  }

  results.sort((a, b) => a.date.localeCompare(b.date));
  return results.slice(0, count);
}
