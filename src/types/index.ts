// ─── Weather ─────────────────────────────────────────────────────────────────

export type WeatherCode =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'snowy';

export interface WeatherData {
  temp_c: number;
  weather: string;
  weatherCode: WeatherCode;
  windSpeed: number;        // m/s
  rainProbability: number;  // 0–100
  precipitationMmh: number; // current precipitation in mm/h (0 when dry)
  uvIndex: number;
  visibility: number;       // km
  updatedAt: string;        // ISO string
}

// ─── Routes ──────────────────────────────────────────────────────────────────

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type RouteCategory = 'takao_course' | 'surrounding_trail';

export interface Route {
  id: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  category: RouteCategory;
  difficulty: Difficulty;
  difficultyRating?: number; // 1-3 stars
  crowdWeekday?: number;     // 1-3 stars
  crowdWeekend?: number;     // 1-3 stars
  distanceKm: number;
  elevationM: number;
  maxElevationM: number;
  durationMin: number;
  features: string[];
  features_en?: string[];
  features_zh?: string[];
  description: string;
  description_en?: string;
  description_zh?: string;
  sourceAttribution?: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export type ProductCategory = 'footwear' | 'apparel' | 'gear';

export interface Product {
  sku: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  category: ProductCategory;
  subCategory: string;
  price: number;
  imageUrl: string;
  descriptionShort: string;
  descriptionShort_en?: string;
  descriptionShort_zh?: string;
  tags: string[];
  isFeatured: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  // Filled in by AI recommendation
  reason?: string;
  reason_en?: string;
  reason_zh?: string;
}

// ─── AI / LLM ─────────────────────────────────────────────────────────────────

export type Mood = 'good' | 'caution' | 'warning';

export interface AdviceResponse {
  advice_text: string;
  advice_short: string;
  safety_flags: string[];
  recommended_gear: string[];
  mood: Mood;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageRole = 'ai' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  advice?: AdviceResponse;
  products?: Product[];
  timestamp: Date;
}

// ─── Trail Status ─────────────────────────────────────────────────────────────

export type TrailSeverity = 'good' | 'caution' | 'warning';

export interface TrailStatusItem {
  label: string;
  label_en?: string;
  label_zh?: string;
  severity: TrailSeverity;
}

export interface TrailStatus {
  updatedAt: string;          // ISO date string — operator sets this
  overallSeverity: TrailSeverity;
  items: TrailStatusItem[];
  closures: string[];         // empty = no closures
  closures_en?: string[];
  closures_zh?: string[];
  photoUrl?: string;
}

// ─── Facilities ───────────────────────────────────────────────────────────────

export type FacilityStatus = 'open' | 'closed' | 'crowded' | 'unknown';

export interface Facility {
  id: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  icon: 'coffee' | 'parking' | 'restroom' | 'water' | 'info';
  status: FacilityStatus;
  detail: string;             // short line shown in card
  detail_en?: string;
  detail_zh?: string;
  hours?: string;             // e.g. "〜16:30頃"
  hours_en?: string;
  hours_zh?: string;
}

// ─── Cable Car / Lift ─────────────────────────────────────────────────────────

export type ServiceStatus = 'operating' | 'suspended' | 'unknown';

export interface CableCarService {
  name: string;
  name_en?: string;
  name_zh?: string;
  status: ServiceStatus;
  firstDeparture: string;     // "HH:MM"
  lastDeparture: string;      // "HH:MM (seasonal)"
  intervalMin: number;
  durationMin: number;
  note?: string;
  note_en?: string;
  note_zh?: string;
}

export interface FareInfo {
  label: string;
  label_en?: string;
  label_zh?: string;
  oneWay: number;
  roundTrip: number;
}

export interface CableCarInfo {
  updatedAt: string;          // ISO date string
  services: CableCarService[];
  fares: FareInfo[];
  paymentNote: string;
  paymentNote_en?: string;
  paymentNote_zh?: string;
}

// ─── Modals ───────────────────────────────────────────────────────────────────

export type ActiveModal =
  | null
  | 'equipment'
  | 'staff'
  | 'camera'
  | 'cablecar';
