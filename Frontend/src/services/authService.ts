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
  return { authUser: backendResponseToAuthUser(data), token: data.token }
}

export async function firebaseLoginApi(
  idToken: string,
): Promise<{ authUser: AuthUser; token: string }> {
  const { data } = await apiClient.post<BackendLoginResponse>('/auth/firebase-login', { idToken })
  return { authUser: backendResponseToAuthUser(data), token: data.token }
}

function backendResponseToAuthUser(data: BackendLoginResponse): AuthUser {
  return {
    id: data.username,
    email: data.username,
    name: data.username,
    role: data.role as AuthUser['role'],
  }
}
