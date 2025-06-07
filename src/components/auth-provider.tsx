"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/src/lib/api"

type User = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MEMBER"
  created_at: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !user && isProtectedRoute(pathname)) {
      router.push("/login")
    }
  }, [isLoading, user, pathname, router])

  const isProtectedRoute = (path: string) => {
    return path.startsWith("/dashboard") || path === "/profile"
  }

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/me")
      setUser(response.data.user)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      localStorage.removeItem("token")
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post("/sessions", { email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    setToken(token)
    setUser(user)

    return user
  }

  const logout = () => {
    localStorage.removeItem("token")
    api.defaults.headers.common["Authorization"] = ""
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
