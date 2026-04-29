import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PageTransitionProvider } from './context/TransitionContext'
import { MainLayout } from './components/layout/MainLayout'
import { RequireAuth } from './routes/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TournamentListPage } from './pages/TournamentListPage'
import { CreateTournamentPage } from './pages/CreateTournamentPage'
import { TournamentDetailPage } from './pages/TournamentDetailPage'
import { ParticipantsPage } from './pages/ParticipantsPage'
import { MatchesPage } from './pages/MatchesPage'
import { AdminPage } from './pages/AdminPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <PageTransitionProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tournaments" element={<TournamentListPage />} />
                <Route path="tournaments/new" element={<CreateTournamentPage />} />
                <Route path="tournaments/:id" element={<TournamentDetailPage />} />
                <Route path="participants" element={<ParticipantsPage />} />
                <Route path="matches" element={<MatchesPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
      </PageTransitionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
