import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../hooks/useAuth'
import { AppLayout } from '../layouts/AppLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { CatalogPage } from '../pages/CatalogPage'
import { EditProfilePage } from '../pages/EditProfilePage'
import { FeedPage } from '../pages/FeedPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { MyProfilePage } from '../pages/MyProfilePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'
import { RestaurantDetailPage } from '../pages/RestaurantDetailPage'
import { UserProfilePage } from '../pages/UserProfilePage'
import { VisitedPage } from '../pages/VisitedPage'
import { WishlistPage } from '../pages/WishlistPage'

function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="mx-auto mt-12 max-w-xl">
        <LoadingState title="Preparando sessão" description="Conferindo seus dados de acesso." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="mx-auto mt-12 max-w-xl">
        <LoadingState title="Preparando sessão" description="Conferindo seus dados de acesso." />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/catalogo" replace />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/restaurantes/:id" element={<RestaurantDetailPage />} />
            <Route path="/lista-desejos" element={<WishlistPage />} />
            <Route path="/visitados" element={<VisitedPage />} />
            <Route path="/meu-perfil" element={<MyProfilePage />} />
            <Route path="/perfil/editar" element={<EditProfilePage />} />
            <Route path="/usuarios/:id" element={<UserProfilePage />} />
            <Route path="/feed" element={<FeedPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
