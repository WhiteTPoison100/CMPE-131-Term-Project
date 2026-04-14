import type { AuthUser } from '../types'

/** Demo accounts for professor / team review — replace with JWT login later */
export const MOCK_CREDENTIALS = {
  organizer: {
    email: 'organizer@demo.edu',
    password: 'organizer123',
  },
  viewer: {
    email: 'viewer@demo.edu',
    password: 'viewer123',
  },
} as const

export const MOCK_USERS: Record<string, AuthUser & { password: string }> = {
  [MOCK_CREDENTIALS.organizer.email]: {
    id: 'user-to-1',
    email: MOCK_CREDENTIALS.organizer.email,
    name: 'Alex Rivera',
    role: 'TO',
    password: MOCK_CREDENTIALS.organizer.password,
  },
  [MOCK_CREDENTIALS.viewer.email]: {
    id: 'user-viewer-1',
    email: MOCK_CREDENTIALS.viewer.email,
    name: 'Jordan Lee',
    role: 'VIEWER',
    password: MOCK_CREDENTIALS.viewer.password,
  },
}
