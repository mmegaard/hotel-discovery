import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

const styles = {
  primary: 'bg-accent text-white hover:bg-accent-strong',
  ghost: 'bg-transparent text-accent hover:bg-accent-tint',
}

/** 44px-tall button in the two styles the design uses. */
export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`h-11 shrink-0 rounded-lg px-5 text-[15px] font-medium ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}
