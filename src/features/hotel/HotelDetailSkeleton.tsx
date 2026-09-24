/** Same boxes as HotelHeader and AmenityList, no content, so the page does
 *  not jump when the hotel arrives. */
export function HotelDetailSkeleton() {
  const bar = 'animate-pulse rounded bg-panel'
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3.5">
        <div className={`h-65 rounded-xl ${bar}`} />
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className={`h-10 w-96 ${bar}`} />
            <div className={`h-5 w-80 ${bar}`} />
          </div>
          <div className={`h-10 w-32 ${bar}`} />
        </div>
        <div className={`h-6 w-full max-w-[68ch] ${bar}`} />
        <div className={`h-6 w-3/4 max-w-[68ch] ${bar}`} />
        <div className={`h-20 rounded-xl ${bar}`} />
      </div>
      <div className="flex flex-col gap-3">
        <div className={`h-7 w-32 ${bar}`} />
        <div className={`h-20 ${bar}`} />
      </div>
    </div>
  )
}
