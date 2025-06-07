import { Button } from "@/src/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
          Embarque na Sua Jornada Fitness
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Encontre harmonia entre mente e corpo. Descubra academias, acompanhe seu progresso com a simplicidade inspirada no Japão.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
          >
            <Link href="/register">Começar Jornada</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-red-500 text-rose-500 hover:bg-red-500 hover:text-white"
          >
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}