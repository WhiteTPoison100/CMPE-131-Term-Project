import { apiClient } from './apiClient'
import type { AuthUser } from '../types'

/** Placeholder: POST /auth/login — wire when Spring Security + JWT exist */
export async function loginApi(_email: string, _password: string): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>('/auth/login', {
    email: _email,
    password: _password,
  })
  return data
}
