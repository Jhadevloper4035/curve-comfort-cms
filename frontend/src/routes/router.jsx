import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import { useAuthContext } from '@/context/useAuthContext';
import { appRoutes, authRoutes, publicRoutes, ALL_ACCESS_TYPES } from '@/routes/index';
import AdminLayout from '@/layouts/AdminLayout';
import Preloader from '@/components/Preloader';
import { getDefaultPathForUser, hasAnyPermission } from '@/constants/access';
import PermissionDenied from '@/app/(admin)/permission-denied/page';

const AppRouter = props => {
  const { isAuthenticated, user, loading } = useAuthContext();

  // Wait for the /me check before rendering any route to avoid flicker
  if (loading) return <Preloader />;

  const isValidUser = isAuthenticated && ALL_ACCESS_TYPES.includes(user?.accessType);

  const routeElement = (route) => {
    if (!isValidUser) {
      return <Navigate to={{ pathname: '/auth/sign-in', search: 'redirectTo=' + route.path }} />;
    }
    if (route.path === '/') {
      const defaultPath = getDefaultPathForUser(user);
      if (defaultPath === '/error-404') {
        return <AdminLayout {...props}><PermissionDenied routeName="Dashboard" /></AdminLayout>;
      }
      return <Navigate to={defaultPath} replace />;
    }
    const hasPermissionRule = Array.isArray(route.permissions) && route.permissions.length > 0;
    const roleAllowed = route.strictRoles
      ? route.strictRoles.includes(user.accessType)
      : hasPermissionRule || !route.roles || route.roles.includes(user.accessType);
    const permissionAllowed = hasAnyPermission(user, route.permissions || []);

    if (!roleAllowed || !permissionAllowed) {
      return <AdminLayout {...props}><PermissionDenied routeName={route.name} /></AdminLayout>;
    }
    return <AdminLayout {...props}>{route.element}</AdminLayout>;
  };

  return <Routes>
      {(publicRoutes || []).map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={
          <Suspense fallback={<Preloader />}>{route.element}</Suspense>
        } />
      ))}

      {(authRoutes || []).map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={<AuthLayout {...props}>{route.element}</AuthLayout>} />
      ))}

      {(appRoutes || []).map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={routeElement(route)} />
      ))}
    </Routes>;
};
export default AppRouter;
