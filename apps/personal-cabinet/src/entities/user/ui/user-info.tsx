import { User } from '../model'
import { UserAvatar } from './user-avatar'

interface UserInfoProps {
  user: User
  showEmail?: boolean
  className?: string
}

export function UserInfo({ user, showEmail = true, className = '' }: UserInfoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <UserAvatar user={user} size="md" />
      <div>
        <div className="font-medium">
          {user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : 'Пользователь'
          }
        </div>
        {showEmail && (
          <div className="text-sm text-gray-500">{user.email}</div>
        )}
      </div>
    </div>
  )
} 