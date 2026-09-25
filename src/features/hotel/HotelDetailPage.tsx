import { Link, useParams } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState'
import { useHotel } from '../../hooks/useHotel'
import { AmenityList } from './AmenityList'
import { BackLink } from './BackLink'
import { HotelDetailSkeleton } from './HotelDetailSkeleton'
import { HotelHeader } from './HotelHeader'
import { RoomAvailability } from './RoomAvailability'

export function HotelDetailPage() {
  const { id = '' } = useParams()
  const { hotel, status } = useHotel(id)

  return (
    <div className="flex grow flex-col gap-5 px-10 pt-6 pb-10">
      <BackLink
        fallbackTo={hotel ? `/hotels?city=${encodeURIComponent(hotel.address.city)}` : '/hotels'}
      />

      {status === 'error' ? (
        <p role="status" className="text-[15px] text-muted">
          Couldn’t load this hotel. Check your connection and try again.
        </p>
      ) : status === 'not-found' ? (
        <div className="mt-10">
          <EmptyState
            title="Hotel not found"
            description="This link may be out of date, or the hotel is no longer listed."
            action={
              <Link
                to="/hotels"
                className="flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-medium text-white hover:bg-accent-strong"
              >
                Browse all hotels
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          {hotel ? (
            <div className="flex flex-col gap-6">
              <HotelHeader hotel={hotel} />
              <AmenityList amenities={hotel.amenities} />
            </div>
          ) : (
            <HotelDetailSkeleton />
          )}
          {hotel ? (
            <RoomAvailability hotel={hotel} />
          ) : (
            <div
              aria-hidden="true"
              className="h-70 animate-pulse rounded-xl border border-line bg-white"
            />
          )}
        </div>
      )}
    </div>
  )
}
