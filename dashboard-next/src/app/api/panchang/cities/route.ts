// dashboard-next/src/app/api/panchang/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import citiesData from '@/data/cities.json';

interface CityEntry {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  altitude: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();
    const country = searchParams.get('country')?.toLowerCase();

    let cities = citiesData as CityEntry[];

    // Filter by search query
    if (query) {
      cities = cities.filter(
        (city) =>
          city.name.toLowerCase().includes(query) ||
          city.state.toLowerCase().includes(query) ||
          city.country.toLowerCase().includes(query)
      );
    }

    // Filter by country
    if (country) {
      cities = cities.filter(
        (city) => city.country.toLowerCase() === country
      );
    }

    return NextResponse.json({
      success: true,
      data: cities,
      total: cities.length,
    });
  } catch (error) {
    console.error('Cities API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
