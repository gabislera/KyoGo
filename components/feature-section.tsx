import { Dumbbell, MapPin, CheckCircle } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: <MapPin className="h-10 w-10 text-purple-500" />,
      title: "Find Nearby Gyms",
      description: "Discover gyms in your area with our location-based search.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-blue-500" />,
      title: "Check In Easily",
      description: "Check in to your workouts with a single tap when you're at the gym.",
    },
    {
      icon: <Dumbbell className="h-10 w-10 text-green-500" />,
      title: "Track Progress",
      description: "Monitor your workout frequency and consistency over time.",
    },
  ]

  return (
    <section className="py-16 px-4 bg-secondary/20">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
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
