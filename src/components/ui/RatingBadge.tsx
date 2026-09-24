export interface RatingBadgeProps {
  rating: number
  /** Appends " out of 5" style text after the number. */
  outOf?: number
}

export function RatingBadge({ rating, outOf }: RatingBadgeProps) {
  return (
    <span
      aria-label={`Rated ${rating.toFixed(1)} out of ${outOf ?? 5}`}
      className="rounded-md bg-accent-tint px-2 py-0.5 text-sm font-semibold text-accent-strong"
    >
      {rating.toFixed(1)}
      {outOf !== undefined && <span className="font-normal"> out of {outOf}</span>}
    </span>
  )
}
