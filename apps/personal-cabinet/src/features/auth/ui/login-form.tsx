import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useAuth } from '../ui/auth-provider'
import { Link, useNavigate } from 'react-router-dom'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form-field'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const { mutate, isPending: isLoading, error } = useMutation({
    mutationFn: ({ email, password }: LoginFormData) => signIn(email, password),
    onSuccess: () => {
      navigate('/dashboard')
    },
  })

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormData) => {
    mutate(data)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
        <CardDescription className="text-center">
          Введите свои учетные данные для входа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
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
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-red-500 text-center">{error.message || 'Неверный email или пароль'}</div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Войти
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Нет аккаунта?{' '}
              </span>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 