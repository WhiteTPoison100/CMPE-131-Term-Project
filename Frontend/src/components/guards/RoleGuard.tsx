import type { ReactNode } from 'react'
import type { UserRole } from '../../types'
import { useAuth } from '../../context/AuthContext'

interface RoleGuardProps {
  allow: UserRole | UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

/** Renders children only when the signed-in user has an allowed role. */
export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()
  const roles = Array.isArray(allow) ? allow : [allow]
  if (!user || !roles.includes(user.role)) return fallback
  return children
}
