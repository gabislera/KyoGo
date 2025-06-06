import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
          Embrace Your Fitness Journey
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find harmony between mind and body. Discover gyms, track your progress with Japanese-inspired simplicity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
          >
            <Link href="/register">Begin Journey</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-red-500 text-rose-500 hover:bg-rose-500 hover:text-white"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
