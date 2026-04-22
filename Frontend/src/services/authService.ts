import { apiClient } from './apiClient'
import type { AuthUser } from '../types'

interface BackendLoginResponse {
  token: string
  username: string
  role: string
}

export async function loginApi(
  username: string,
  password: string,
): Promise<{ authUser: AuthUser; token: string }> {
  const { data } = await apiClient.post<BackendLoginResponse>('/auth/login', {
    username,
    password,
  })
  const authUser: AuthUser = {
    id: data.username,
    email: data.username,
    name: data.username,
    role: data.role as AuthUser['role'],
  }
  return { authUser, token: data.token }
}
