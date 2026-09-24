import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex grow flex-col items-center justify-center gap-3 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="text-[28px] font-semibold">Page not found</h1>
      <p className="text-base text-muted">The page you are looking for does not exist.</p>
      <Link
        to="/hotels"
        className="mt-3 flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-medium text-white hover:bg-accent-strong"
      >
        Search hotels
      </Link>
    </div>
  )
}
