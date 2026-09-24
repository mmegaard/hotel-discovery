// Shapes mirror the backend brief and src/data/hotels.json verbatim (snake_case
// keys), so the mock API and a real API return identical objects.

export interface Address {
  street: string
  city: string
  state: string
  zip_code: string
  country: string
}

export interface Contact {
  phone: string
  email: string
}

export interface Policies {
  check_in_time: string
  check_out_time: string
  cancellation: string
}

export interface Room {
  room_id: string
  type: string
  bed_type: string
  bed_count: number
  max_occupancy: number
  square_footage: number
  price_per_night: number
  room_amenities: string[]
  /** ISO dates (YYYY-MM-DD) on which the room can be booked for the night. */
  available_dates: string[]
}

export interface Hotel {
  id: string
  name: string
  description: string
  star_rating: number
  overall_rating: number
  review_count: number
  address: Address
  contact: Contact
  amenities: string[]
  policies: Policies
  rooms: Room[]
}

/** Search-page filters. Every field optional; undefined means "not filtering". */
export interface HotelFilters {
  city?: string
  stars?: number[]
  minPrice?: number
  maxPrice?: number
}
