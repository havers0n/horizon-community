
import { LoginForm } from '@/features/auth'
import { ApiTest } from '@/features/auth/ui/api-test'
import { ServerTest } from '@/features/auth/ui/server-test'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Вход в систему
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Войдите в свой аккаунт для доступа к системе
          </p>
        </div>

        <div className="flex gap-8 justify-center flex-wrap">
          <LoginForm />
          <ApiTest />
          <ServerTest />
        </div>
      </div>
    </div>
  )
}

export { LoginPage } 