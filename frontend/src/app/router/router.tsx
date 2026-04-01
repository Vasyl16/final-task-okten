import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/widgets/layout/app-layout'
import { FavoritesPage } from '@/pages/favorites-page'
import { HomePage } from '@/pages/home-page'
import { AdminPage } from '@/pages/admin/AdminPage'
import { LoginPage } from '@/pages/auth/login-page'
import { RegisterPage } from '@/pages/auth/register-page'
import { CreateInstitutionPage } from '@/pages/institutions/CreateInstitutionPage'
import { EditInstitutionPage } from '@/pages/institutions/EditInstitutionPage'
import { InstitutionDetailsPage } from '@/pages/institutions/InstitutionDetailsPage'
import { InstitutionsPage } from '@/pages/institutions/InstitutionsPage'
import { CreateNewsPage } from '@/pages/news/CreateNewsPage'
import { NewsDetailsPage } from '@/pages/news/NewsDetailsPage'
import { NewsPage } from '@/pages/news/NewsPage'
import { PiyachokDetailPage } from '@/pages/piyachok/PiyachokDetailPage'
import { PiyachokPage } from '@/pages/piyachok/PiyachokPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { TopPage } from '@/pages/top/TopPage'
import { RequireAuth, RequireGuest } from './route-guards'

export const appRouter = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'institutions',
            element: <InstitutionsPage />,
          },
          {
            path: 'institutions/new',
            element: <CreateInstitutionPage />,
          },
          {
            path: 'institutions/:id/edit',
            element: <EditInstitutionPage />,
          },
          {
            path: 'institutions/:id',
            element: <InstitutionDetailsPage />,
          },
          {
            path: 'top',
            element: <TopPage />,
          },
          {
            path: 'news',
            element: <NewsPage />,
          },
          {
            path: 'news/new',
            element: <CreateNewsPage />,
          },
          {
            path: 'news/:id',
            element: <NewsDetailsPage />,
          },
          {
            path: 'piyachok/:id',
            element: <PiyachokDetailPage />,
          },
          {
            path: 'piyachok',
            element: <PiyachokPage />,
          },
          {
            path: 'favorites',
            element: <FavoritesPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'admin',
            element: <AdminPage />,
          },
        ],
      },
    ],
  },
])
