import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">GymTrack</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeatureSection />
      </main>

      <footer className="container mx-auto py-8 px-4 border-t border-border mt-12">
        <div className="text-center text-muted-foreground">
          <p>© 2025 GymTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
