import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from 'react'
import { loginUser, signupUser } from '../services/authService'

const AuthContext = createContext(null)
const TOKEN_KEY = 'ams_token'
const USER_KEY = 'ams_user'

function readStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY)
  const userRaw = localStorage.getItem(USER_KEY)

  if (!token || !userRaw) {
    return { token: null, user: null }
  }

  try {
    return { token, user: JSON.parse(userRaw) }
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuthState] = useState(() => readStoredAuth())
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    startTransition(() => {
      setAuthState(readStoredAuth())
      setIsBootstrapping(false)
    })
  }, [])

  const persistAuth = (payload) => {
    localStorage.setItem(TOKEN_KEY, payload.token)
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
    setAuthState(payload)
  }

  const login = async (credentials) => {
    const response = await loginUser(credentials)
    persistAuth(response)
    return response
  }

  const signup = async (payload) => {
    const response = await signupUser(payload)
    persistAuth(response)
    return response
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthState({ token: null, user: null })
  }

  const updateUser = (nextUser) => {
    const payload = { token, user: nextUser }
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setAuthState(payload)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        isBootstrapping,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
