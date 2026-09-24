import { useParams } from 'react-router'

export function HotelDetailPage() {
  const { id } = useParams()
  return (
    <div className="px-10 py-8">
      <h1 className="text-2xl font-semibold">Hotel {id}</h1>
    </div>
  )
}
