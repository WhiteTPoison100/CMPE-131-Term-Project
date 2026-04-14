import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppDataProvider } from './context/AppDataContext'
import { MainLayout } from './components/layout/MainLayout'
import { RequireAuth } from './routes/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TournamentListPage } from './pages/TournamentListPage'
import { CreateTournamentPage } from './pages/CreateTournamentPage'
import { TournamentDetailPage } from './pages/TournamentDetailPage'
import { ParticipantsPage } from './pages/ParticipantsPage'
import { MatchesPage } from './pages/MatchesPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
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
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
