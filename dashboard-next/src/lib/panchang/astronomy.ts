// dashboard-next/src/lib/panchang/astronomy.ts
import * as Astronomy from 'astronomy-engine';

/**
 * Get the ecliptic longitude of the Sun at a given date.
 * Returns value in degrees (0-360).
 */
export function getSunLongitude(date: Date): number {
  const astroTime = Astronomy.MakeTime(date);
  const sunEcliptic = Astronomy.SunPosition(astroTime);
  let lon = sunEcliptic.elon;
  if (lon < 0) lon += 360;
  return lon;
}

/**
 * Get the ecliptic longitude of the Moon at a given date.
 * Returns value in degrees (0-360).
 */
export function getMoonLongitude(date: Date): number {
  const astroTime = Astronomy.MakeTime(date);
  const moonEcliptic = Astronomy.EclipticGeoMoon(astroTime);
  let lon = moonEcliptic.lon;
  if (lon < 0) lon += 360;
  return lon;
}

/**
 * Get the angular difference between Moon and Sun longitudes.
 * This is the basis for Tithi calculation.
 * Returns value in degrees (0-360).
 */
export function getMoonSunAngle(date: Date): number {
  const sunLon = getSunLongitude(date);
  const moonLon = getMoonLongitude(date);
  let diff = moonLon - sunLon;
  if (diff < 0) diff += 360;
  return diff;
}

/**
 * Find the exact time when the Moon-Sun angle crosses a given degree boundary.
 * Uses binary search for precision.
 * @param startDate Start of search window
 * @param endDate End of search window
 * @param targetAngle The target Moon-Sun angle in degrees
 * @param toleranceMinutes Precision in minutes (default 1 minute)
 */
export function findAngleCrossing(
  startDate: Date,
  endDate: Date,
  targetAngle: number,
  toleranceMinutes: number = 1
): Date {
  let lo = startDate.getTime();
  let hi = endDate.getTime();
  const toleranceMs = toleranceMinutes * 60 * 1000;

  while (hi - lo > toleranceMs) {
    const mid = lo + (hi - lo) / 2;
    const midDate = new Date(mid);
    const angle = getMoonSunAngle(midDate);

    // Handle the wrap-around at 360/0 boundary
    let diff = angle - targetAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (diff < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return new Date(lo + (hi - lo) / 2);
}

/**
 * Find the exact time when the Moon longitude crosses a given degree boundary.
 * Used for Nakshatra transitions.
 */
export function findMoonLongitudeCrossing(
  startDate: Date,
  endDate: Date,
  targetLongitude: number,
  toleranceMinutes: number = 1
): Date {
  let lo = startDate.getTime();
  let hi = endDate.getTime();
  const toleranceMs = toleranceMinutes * 60 * 1000;

  while (hi - lo > toleranceMs) {
    const mid = lo + (hi - lo) / 2;
    const midDate = new Date(mid);
    const moonLon = getMoonLongitude(midDate);

    let diff = moonLon - targetLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (diff < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return new Date(lo + (hi - lo) / 2);
}
