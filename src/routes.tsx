import { Navigate, type RouteObject } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { HotelDetailPage } from './features/hotel/HotelDetailPage'
import { NotFoundPage } from './features/notFound/NotFoundPage'
import { SearchPage } from './features/search/SearchPage'

// Route table only; main.tsx binds it to the browser, tests to a memory router.
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/hotels" replace /> },
      { path: '/hotels', element: <SearchPage /> },
      { path: '/hotels/:id', element: <HotelDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
