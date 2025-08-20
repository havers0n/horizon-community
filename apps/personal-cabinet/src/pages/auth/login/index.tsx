
import { LoginForm } from '@/features/auth'
import { H2, P, Stack } from '@/shared/ui'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <Stack space="xl">
          <div className="text-center">
            <Stack space="sm">
              <H2 className="font-extrabold text-gray-900">Вход в систему</H2>
              <P className="text-sm text-gray-600">Войдите в свой аккаунт для доступа к системе</P>
            </Stack>
          </div>
          <div className="flex gap-8 justify-center flex-wrap">
            <LoginForm />
          </div>
        </Stack>
      </div>
    </div>
  )
}

export { LoginPage } 