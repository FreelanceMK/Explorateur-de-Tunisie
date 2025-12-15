// Static credentials (in production, this would be validated against a secure backend)
const VALID_CREDENTIALS = [
  {
    email: "karimomrane7@gmail.com",
    password: "12345678",
  },
  {
    email: "communication@ste-stecom.com",
    password: "Stecom2025!",
  },
  {
    email: "marketing@ste-stecom.com",
    password: "Marketing2025!",
  },
  {
    email: "amari.jamel@ste-stecom.com",
    password: "Jamel2025!",
  },
]

export interface AuthSession {
  email: string
  expiresAt: number
  rememberMe: boolean
}

const SESSION_KEY = "tunisia_explorer_session"
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

/**
 * Validate login credentials
 */
export function validateCredentials(email: string, password: string): boolean {
  return VALID_CREDENTIALS.some(
    (cred) => cred.email === email && cred.password === password
  )
}

/**
 * Create a new session and store it in localStorage
 */
export function createSession(email: string, rememberMe: boolean): void {
  const expiresAt = Date.now() + SESSION_DURATION
  const session: AuthSession = {
    email,
    expiresAt,
    rememberMe,
  }
  
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}

/**
 * Get the current session from localStorage
 */
export function getSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null
  }
  
  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (!sessionData) {
      return null
    }
    
    const session: AuthSession = JSON.parse(sessionData)
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error("Error reading session:", error)
    clearSession()
    return null
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const session = getSession()
  return session !== null
}

/**
 * Clear the session from localStorage
 */
export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Refresh the session expiry time
 */
export function refreshSession(): void {
  const session = getSession()
  if (session && session.rememberMe) {
    createSession(session.email, session.rememberMe)
  }
}
