import { useId, type ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  /** A button or link rendered under the text. */
  action?: ReactNode
  icon?: ReactNode
  /** "status" for informational states, "alert" for validation failures. */
  role?: 'status' | 'alert'
  /** Smaller padding and heading, for use inside a panel that already has one. */
  compact?: boolean
  headingLevel?: 2 | 3
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  role = 'status',
  compact = false,
  headingLevel = 2,
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const headingId = useId()
  return (
    <div
      role={role}
      aria-labelledby={headingId}
      className={`flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-white text-center ${
        compact ? 'gap-2 px-4 py-7' : 'gap-3 px-6 py-14'
      }`}
    >
      {icon}
      <Heading className={compact ? 'text-base font-semibold' : 'text-xl font-semibold'}>
        {title}
      </Heading>
      {description && (
        <p className={compact ? 'text-sm text-muted' : 'text-[15px] text-muted'}>{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
