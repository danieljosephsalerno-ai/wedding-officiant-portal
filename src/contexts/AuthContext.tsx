'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type UserType = 'professional-writer' | 'officiant' | 'guest'

export interface User {
  id: string
  name: string
  email: string
  userType: UserType
  weddingDate?: string
  partner?: string
  location?: string
  avatar?: string
  bio?: string
  favoriteScripts: number[]
  purchasedScripts: number[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean | string>
  logout: () => void
  signup: (userData: Partial<User> & { email: string; password: string; name: string; userType: UserType }) => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
  toggleFavorite: (scriptId: number) => Promise<void>
  isFavorited: (scriptId: number) => boolean
  addPurchase: (scriptIds: number[]) => Promise<void>
  isPurchased: (scriptId: number) => boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Load user data from Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          await loadUserData(session.user)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserData(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      // Get user's favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('script_id')
        .eq('user_id', supabaseUser.id)

      // Get user's purchases
      const { data: purchases } = await supabase
        .from('purchases')
        .select('script_id')
        .eq('user_id', supabaseUser.id)

      setUser({
        id: supabaseUser.id,
        name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email!,
        userType: profile?.user_type || 'guest',
        location: profile?.location,
        bio: profile?.bio,
        weddingDate: profile?.wedding_date,
        partner: profile?.partner,
        avatar: profile?.avatar_url,
        favoriteScripts: favorites?.map(f => f.script_id) || [],
        purchasedScripts: purchases?.map(p => p.script_id) || [],
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean | string> => {
    try {
      console.log('Attempting login for:', email)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error.message, error)
        // Return the actual error message for debugging
        return error.message || 'Login failed'
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id)
        await loadUserData(data.user)
        return true
      }

      return 'No user data returned'
    } catch (error) {
      console.error('Login exception:', error)
      return error instanceof Error ? error.message : 'Login failed'
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const signup = async (userData: Partial<User> & { email: string; password: string; name: string; userType: UserType }): Promise<boolean> => {
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            user_type: userData.userType,
            location: userData.location,
            bio: userData.bio,
            wedding_date: userData.weddingDate,
            partner: userData.partner,
          },
        },
      })

      if (error) {
        console.error('Signup error:', error)
        return false
      }

      if (data.user) {
        await loadUserData(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return

    try {
      // Update profile in database
      await supabase
        .from('profiles')
        .update({
          name: userData.name,
          user_type: userData.userType,
          location: userData.location,
          bio: userData.bio,
          wedding_date: userData.weddingDate,
          partner: userData.partner,
          avatar_url: userData.avatar,
        })
        .eq('id', user.id)

      // Update local state
      setUser({ ...user, ...userData })
    } catch (error) {
      console.error('Update user error:', error)
    }
  }

  const toggleFavorite = async (scriptId: number) => {
    if (!user) return

    const isFav = user.favoriteScripts.includes(scriptId)

    try {
      if (isFav) {
        // Remove from favorites
        await fetch(`/api/favorites?scriptId=${scriptId}`, {
          method: 'DELETE',
        })

        setUser({
          ...user,
          favoriteScripts: user.favoriteScripts.filter(id => id !== scriptId),
        })
      } else {
        // Add to favorites
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scriptId }),
        })

        setUser({
          ...user,
          favoriteScripts: [...user.favoriteScripts, scriptId],
        })
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
    }
  }

  const isFavorited = (scriptId: number): boolean => {
    if (!user) return false
    return user.favoriteScripts.includes(scriptId)
  }

  const addPurchase = async (scriptIds: number[]) => {
    if (!user) return

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptIds }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update local state with purchased scripts
        const newPurchases = scriptIds.filter(id => !user.purchasedScripts.includes(id))
        if (newPurchases.length > 0) {
          setUser({
            ...user,
            purchasedScripts: [...user.purchasedScripts, ...newPurchases],
          })
        }
      }
    } catch (error) {
      console.error('Add purchase error:', error)
    }
  }

  const isPurchased = (scriptId: number): boolean => {
    if (!user) return false
    return user.purchasedScripts.includes(scriptId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
        updateUser,
        toggleFavorite,
        isFavorited,
        addPurchase,
        isPurchased,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
