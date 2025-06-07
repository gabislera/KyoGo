import { Dumbbell, MapPin, CheckCircle } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: <MapPin className="h-10 w-10 text-purple-500" />,
      title: "Encontre Academias Próximas",
      description: "Descubra academias na sua região com nossa busca por localização.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-blue-500" />,
      title: "Check-in Fácil",
      description: "Registre seus treinos com um único toque quando estiver na academia.",
    },
    {
      icon: <Dumbbell className="h-10 w-10 text-green-500" />,
      title: "Acompanhe Seu Progresso",
      description: "Monitore sua frequência e consistência nos treinos ao longo do tempo.",
    },
  ]

  return (
    <section className="py-16 px-4 bg-secondary/20">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Recursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-lg shadow-lg border border-border flex flex-col items-center text-center"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}