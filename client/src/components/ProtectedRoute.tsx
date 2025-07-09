import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { token } = useAuthContext();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

/* Usage in client/src/main.tsx or App.tsx */
// import { AuthProvider } from './hooks/AuthContext';
// <AuthProvider>
//   <BrowserRouter>
//     <Routes>
//       <Route path="/dashboard" element={
//         <ProtectedRoute>
//           <DashboardPage />
//         </ProtectedRoute>
//       } />
//     </Routes>
//   </BrowserRouter>
// </AuthProvider>
