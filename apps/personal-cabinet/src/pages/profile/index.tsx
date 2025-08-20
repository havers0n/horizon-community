import React from 'react'
import { PageHeader, SectionCard } from '@/shared/ui/page-sections'

const ProfilePage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <PageHeader title="Профиль" description="Ваши данные и настройки профиля" />

      <SectionCard>
        <p className="text-sm text-muted-foreground">Страница профиля в разработке</p>
      </SectionCard>
    </div>
  )
}

export default ProfilePage 