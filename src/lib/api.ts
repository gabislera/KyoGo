import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  withCredentials: true,
})

// Add a response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const response = await api.patch("/token/refresh")
        const { token } = response.data

        // Update token in localStorage and headers
        localStorage.setItem("token", token)
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        originalRequest.headers["Authorization"] = `Bearer ${token}`

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Add token to requests if available
if (typeof window !== "undefined") {
  const token = localStorage.getItem("token")
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }
}
