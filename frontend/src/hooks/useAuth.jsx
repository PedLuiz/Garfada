/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { userService } from '../services/userService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [me, setMe] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      try {
        const existingSession = await authService.getSession()

        if (existingSession) {
          setSession(existingSession)
          const profile = await userService.getMe()
          setMe(profile)
        }
      } catch {
        setSession(null)
        setMe(null)
      } finally {
        setIsBootstrapping(false)
      }
    }

    bootstrap()
  }, [])

  async function login(credentials) {
    const newSession = await authService.login(credentials)
    setSession(newSession)
    const profile = await userService.getMe()
    setMe(profile)

    return { session: newSession, profile }
  }

  async function register(payload) {
    const newSession = await authService.register(payload)
    setSession(newSession)
    const profile = await userService.getMe()
    setMe(profile)

    return { session: newSession, profile }
  }

  async function refreshMe() {
    if (!session) {
      return null
    }

    const profile = await userService.getMe()
    setMe(profile)
    return profile
  }

  async function logout() {
    await authService.logout()
    setSession(null)
    setMe(null)
  }

  const value = {
    session,
    me,
    isAuthenticated: Boolean(session),
    isBootstrapping,
    login,
    register,
    logout,
    refreshMe,
    setMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
