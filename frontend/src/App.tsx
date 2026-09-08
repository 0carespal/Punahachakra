import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreProvider } from './context/store';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StoreProvider>
  );
}
