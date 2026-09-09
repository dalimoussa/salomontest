import type { WeatherData, WeatherCode } from '@/types';

const LAT = 35.6252;
const LON = 139.2437;

function mapWmoToWeatherCode(wmo: number): WeatherCode {
  if (wmo === 0 || wmo === 1) return 'sunny';
  if (wmo === 2 || wmo === 3) return 'partly_cloudy';
  if (wmo >= 45 && wmo <= 48) return 'cloudy';
  if (wmo >= 51 && wmo <= 67) return 'rainy';
  if (wmo >= 71 && wmo <= 77) return 'snowy';
  if (wmo >= 80 && wmo <= 82) return 'rainy';
  if (wmo >= 85 && wmo <= 86) return 'snowy';
  if (wmo >= 95) return 'rainy';
  return 'cloudy';
}

function mapWmoToLabel(wmo: number): string {
  if (wmo === 0) return '快晴';
  if (wmo === 1) return '晴れ';
  if (wmo === 2) return '晴れ時々曇り';
  if (wmo === 3) return '曇り';
  if (wmo >= 45 && wmo <= 48) return '霧';
  if (wmo >= 51 && wmo <= 55) return '霧雨';
  if (wmo >= 61 && wmo <= 65) return '雨';
  if (wmo >= 66 && wmo <= 67) return '凍雨';
  if (wmo >= 71 && wmo <= 77) return '雪';
  if (wmo >= 80 && wmo <= 82) return 'にわか雨';
  if (wmo >= 85 && wmo <= 86) return 'にわか雪';
  if (wmo >= 95) return '雷雨';
  return '曇り';
}

interface OpenMeteoResponse {
  current: { temperature_2m: number; weathercode: number; windspeed_10m: number };
  hourly:  {
    precipitation: number[];
    precipitation_probability: number[];
    uv_index: number[];
    visibility: number[];
  };
}

export async function fetchWeather(): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(LAT));
  url.searchParams.set('longitude', String(LON));
  url.searchParams.set('elevation', '599'); // Mt. Takao Summit (599m)
  url.searchParams.set('current', 'temperature_2m,weathercode,windspeed_10m');
  url.searchParams.set('hourly', 'precipitation,precipitation_probability,uv_index,visibility');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'Asia/Tokyo');

  const response = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`);

  const data: OpenMeteoResponse = await response.json();
  return {
    temp_c:           Math.round(data.current.temperature_2m),
    weather:          mapWmoToLabel(data.current.weathercode),
    weatherCode:      mapWmoToWeatherCode(data.current.weathercode),
    windSpeed:        Math.round(data.current.windspeed_10m * 10) / 10,
    rainProbability:  data.hourly.precipitation_probability?.[0] ?? 0,
    // Open-Meteo returns hourly mm; treat as mm/h for the current hour
    precipitationMmh: data.hourly.precipitation?.[0] ?? 0,
    uvIndex:          Math.round(data.hourly.uv_index?.[0] ?? 0),
    visibility:       Math.round((data.hourly.visibility?.[0] ?? 10000) / 1000),
    updatedAt:        new Date().toISOString(),
  };
}
