import { Link, useNavigate } from 'react-router'

export interface BackLinkProps {
  /** Where to go when there is no history to step back into. */
  fallbackTo: string
}

/** "Back to results": history back when the user came from within the app
 *  (React Router stores an index in history.state), otherwise the fallback
 *  URL. Rendered as a real link so the fallback works without JavaScript
 *  and shows in the status bar. */
export function BackLink({ fallbackTo }: BackLinkProps) {
  const navigate = useNavigate()
  const hasHistory = typeof window !== 'undefined' && (window.history.state?.idx ?? 0) > 0

  return (
    <Link
      to={fallbackTo}
      onClick={(e) => {
        if (hasHistory) {
          e.preventDefault()
          navigate(-1)
        }
      }}
      className="flex min-h-11 items-center gap-1.5 self-start text-[15px] font-medium text-accent hover:text-accent-strong"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
      Back to results
    </Link>
  )
}
