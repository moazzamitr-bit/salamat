import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import PublicHomePage from '@/features/public/PublicHomePage'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import CitizenDashboard from '@/features/dashboard/CitizenDashboard'
import HealthRecordPage from '@/features/health-records/HealthRecordPage'
import AppointmentsPage from '@/features/appointments/AppointmentsPage'
import ScreeningsPage from '@/features/screenings/ScreeningsPage'
import BmiCalculator from '@/features/screenings/BmiCalculator'
import ScreeningFlow from '@/features/screenings/ScreeningFlow'
import RemindersPage from '@/features/reminders/RemindersPage'
import CentersPage from '@/features/centers/CentersPage'
import EducationPage from '@/features/education/EducationPage'
import ArticleDetailPage from '@/features/education/ArticleDetailPage'
import AssistantPage from '@/features/ai-assistant/AssistantPage'
import FamilyPage from '@/features/family/FamilyPage'
import ProfilePage from '@/features/profile/ProfilePage'
import AccessHistoryPage from '@/features/profile/AccessHistoryPage'
import MessagesPage from '@/features/messages/MessagesPage'
import CareTeamDashboard from '@/features/care-team/CareTeamDashboard'
import AdminDashboard from '@/features/admin/AdminDashboard'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <PublicHomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/centers', element: <CentersPage /> },
      { path: '/education', element: <EducationPage /> },
      { path: '/education/:id', element: <ArticleDetailPage /> },
      { path: '/assistant', element: <AssistantPage /> },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/health-record',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <HealthRecordPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/appointments',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <AppointmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/screenings',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <ScreeningsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/screenings/bmi',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <BmiCalculator />
          </ProtectedRoute>
        ),
      },
      {
        path: '/screenings/:slug',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <ScreeningFlow />
          </ProtectedRoute>
        ),
      },
      {
        path: '/reminders',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <RemindersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/family',
        element: (
          <ProtectedRoute roles={['citizen']}>
            <FamilyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile/access-history',
        element: (
          <ProtectedRoute>
            <AccessHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/messages',
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/care-team',
        element: (
          <ProtectedRoute roles={['care_team']}>
            <CareTeamDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
