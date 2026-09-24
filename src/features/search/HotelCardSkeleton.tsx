/** Same box as HotelCard, no content. The list swaps these for real cards when
 *  the query answers, so the page never jumps. */
export function HotelCardSkeleton() {
  const bar = 'animate-pulse rounded bg-panel'
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 gap-5 rounded-xl border border-line bg-white p-4"
    >
      <div className={`h-28 w-42 shrink-0 rounded-lg ${bar}`} />
      <div className="flex min-w-0 grow flex-col gap-1.5">
        <div className={`h-7 w-64 ${bar}`} />
        <div className={`h-5 w-48 ${bar}`} />
        <div className={`h-5 w-40 ${bar}`} />
        <div className="mt-auto flex gap-2">
          <div className={`h-6 w-14 rounded-full ${bar}`} />
          <div className={`h-6 w-20 rounded-full ${bar}`} />
          <div className={`h-6 w-24 rounded-full ${bar}`} />
        </div>
      </div>
      <div className="flex w-40 shrink-0 flex-col items-end justify-end gap-1">
        <div className={`h-4 w-10 ${bar}`} />
        <div className={`h-7 w-16 ${bar}`} />
        <div className={`h-4 w-14 ${bar}`} />
      </div>
    </div>
  )
}
