import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FamilyMember, Profile, UserRole } from '@/types'
import { DEMO_ACCOUNTS } from '@/lib/constants'
import {
  adminProfile,
  careTeamProfile,
  citizenProfile,
  familyMembers as allFamilyMembers,
} from '@/mock-data/profiles'

interface AuthUser {
  profile: Profile
  role: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  activePatientId: string
  activePatientName: string
  familyMembers: FamilyMember[]
  login: (email: string, password: string) => { ok: boolean; error?: string }
  loginAsDemo: (role: UserRole) => void
  logout: () => void
  setActivePatient: (patientId: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'selfcare.demo.auth'

function profileForRole(role: UserRole): Profile {
  if (role === 'care_team') return careTeamProfile
  if (role === 'admin') return adminProfile
  return citizenProfile
}

function readStoredAuth(): { user: AuthUser; activePatientId: string } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { role: UserRole; activePatientId: string }
    if (!parsed?.role) return null
    return {
      user: { profile: profileForRole(parsed.role), role: parsed.role },
      activePatientId: parsed.activePatientId || profileForRole(parsed.role).id,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStoredAuth()
  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null)
  const [activePatientId, setActivePatientId] = useState(
    stored?.activePatientId ?? citizenProfile.id
  )

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ role: user.role, activePatientId })
    )
  }, [user, activePatientId])

  const familyMembers = useMemo(() => {
    if (!user || user.role !== 'citizen') return []
    return allFamilyMembers.filter((m) => m.ownerId === user.profile.id)
  }, [user])

  const activePatientName = useMemo(() => {
    if (!user) return ''
    if (activePatientId === user.profile.id) return user.profile.fullName
    const member = familyMembers.find((m) => m.patientId === activePatientId)
    return member?.profile.fullName ?? user.profile.fullName
  }, [user, activePatientId, familyMembers])

  const login = useCallback((email: string, password: string) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    )
    if (!account) {
      return { ok: false, error: 'ایمیل یا رمز عبور نادرست است.' }
    }
    const profile = profileForRole(account.role)
    setUser({ profile, role: account.role })
    setActivePatientId(account.role === 'citizen' ? citizenProfile.id : profile.id)
    return { ok: true }
  }, [])

  const loginAsDemo = useCallback((role: UserRole) => {
    const profile = profileForRole(role)
    setUser({ profile, role })
    setActivePatientId(role === 'citizen' ? citizenProfile.id : profile.id)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setActivePatientId(citizenProfile.id)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const setActivePatient = useCallback(
    (patientId: string) => {
      if (!user) return
      if (patientId === user.profile.id) {
        setActivePatientId(patientId)
        return
      }
      const allowed = familyMembers.some((m) => m.patientId === patientId)
      if (allowed) setActivePatientId(patientId)
    },
    [user, familyMembers]
  )

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    activePatientId,
    activePatientName,
    familyMembers,
    login,
    loginAsDemo,
    logout,
    setActivePatient,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
