import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="flex h-16 shrink-0 items-center border-b border-line bg-white px-10">
        <span className="text-lg font-semibold tracking-tight">StayFinder</span>
      </header>
      <main className="flex grow flex-col">
        <Outlet />
      </main>
    </div>
  )
}
