import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  /** A button or link rendered under the text. */
  action?: ReactNode
  icon?: ReactNode
  /** "status" for informational states, "alert" for validation failures. */
  role?: 'status' | 'alert'
}

export function EmptyState({ title, description, action, icon, role = 'status' }: EmptyStateProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong bg-white px-6 py-14 text-center"
    >
      {icon}
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="text-[15px] text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
