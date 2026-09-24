import { humanizeAmenity } from '../../lib/format'

export interface AmenityListProps {
  amenities: string[]
}

export function AmenityList({ amenities }: AmenityListProps) {
  return (
    <section aria-labelledby="amenities" className="flex flex-col gap-3">
      <h2 id="amenities" className="text-xl font-semibold">
        Amenities
      </h2>
      <ul className="grid grid-cols-3 gap-x-6 gap-y-2.5 text-[15px]">
        {amenities.map((amenity) => (
          <li key={amenity} className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 text-accent"
            >
              <path d="M3 8.5l3.2 3L13 4.5" />
            </svg>
            {humanizeAmenity(amenity)}
          </li>
        ))}
      </ul>
    </section>
  )
}
