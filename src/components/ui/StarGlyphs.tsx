export interface StarGlyphsProps {
  stars: number
  max?: number
}

/** ★★★★☆ with an accessible "4-star" label. */
export function StarGlyphs({ stars, max = 5 }: StarGlyphsProps) {
  return (
    <span aria-label={`${stars}-star`}>
      <span aria-hidden="true" className="tracking-[1px]">
        {'★'.repeat(stars) + '☆'.repeat(Math.max(0, max - stars))}
      </span>
    </span>
  )
}
