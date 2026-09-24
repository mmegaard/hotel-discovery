export interface RatingBadgeProps {
  rating: number
  size?: 'sm' | 'lg'
}

const sizes = {
  sm: 'rounded-md px-2 py-0.5 text-sm',
  lg: 'rounded-lg px-2.5 py-1.5 text-lg',
}

export function RatingBadge({ rating, size = 'sm' }: RatingBadgeProps) {
  return (
    <span
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
      className={`bg-accent-tint font-semibold text-accent-strong ${sizes[size]}`}
    >
      {rating.toFixed(1)}
    </span>
  )
}
