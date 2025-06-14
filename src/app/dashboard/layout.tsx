import type React from "react"
import { Sidebar } from "@/src/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Sidebar />
      <div className="flex-1">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
