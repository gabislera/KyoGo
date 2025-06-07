import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/src/components/theme-provider"
import { AuthProvider } from "@/src/components/auth-provider"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "KyoGo - Gym Management",
  description: "Track your fitness journey with Japanese-inspired simplicity",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
            <Toaster richColors position="bottom-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}