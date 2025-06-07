"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { useAuth } from "@/src/hooks/use-auth"
import { JapaneseYen } from "lucide-react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Por favor, insira um email válido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success("Login realizado com sucesso!", {
        description: "Bem-vindo de volta."
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast.error("Falha no login", {
        description: error.response?.data?.message || "Credenciais inválidas"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg border border-border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Link href='/'>
              <JapaneseYen className="w-6 h-6 text-red-500" />
            </Link>
          </div>
          <h2 className="text-xl font-semibold">Bem-vindo de Volta</h2>
          <p className="text-muted-foreground mt-2">Continue sua jornada fitness</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao.silva@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Registrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
