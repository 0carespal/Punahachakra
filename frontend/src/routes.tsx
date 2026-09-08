import { createBrowserRouter } from 'react-router';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import CompanyPortal from './pages/CompanyPortal';
import KabadiwalaPortal from './pages/KabadiwalaPortal';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', Component: Landing },
  { path: '/login', Component: Auth },
  {
    path: '/company',
    element: (
      <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
        <CompanyPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: '/kabadiwala',
    element: (
      <ProtectedRoute allowedRoles={['KABADIWALA', 'ADMIN']}>
        <KabadiwalaPortal />
      </ProtectedRoute>
    ),
  },
]);
