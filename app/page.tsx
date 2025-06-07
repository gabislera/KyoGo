import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { JapaneseYen } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <JapaneseYen className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-bold">KyoGo</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
          >
            <Link href="/register">Registrar</Link>
          </Button>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeatureSection />
      </main>

      <footer className="container mx-auto py-8 px-4 border-t border-border mt-12">
        <div className="text-center text-muted-foreground">
          <p>© 2025 KyoGo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
