import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '@layouts/MainLayout'
import Login from '@pages/auth/Login'
import Register from '@pages/auth/Register'
import ForgotPassword from '@pages/auth/ForgotPassword'
import Dashboard from '../pages/Dashboard/Dashboard'
import About from '../pages/About/About'
import Contact from '../pages/Contact/Contact'
import ProtectedRoute from '@components/ProtectedRoute'
import Account from '@/pages/Account/Account'
import ChangePassword from '@/pages/ChangePassword/ChangePassword'
import Categories from '@/pages/Categories/Categories'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        ),
      },
      {
        path: 'change-password',
        element: (
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: 'categories',
        element: (
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        ),
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      { path: '*', element: <div className="max-w-6xl mx-auto px-4 py-10">Not Found</div> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register', 
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
])

export default router
