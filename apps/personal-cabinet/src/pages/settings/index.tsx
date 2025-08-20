import React from 'react'
import { ThemeToggle } from '@/features/settings/theme-toggle'
import { PageHeader, SectionCard } from '@/shared/ui/page-sections'

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <PageHeader title="Настройки" description="Персонализация интерфейса и предпочтения" />

      <SectionCard>
        <ThemeToggle />
      </SectionCard>

      <SectionCard>
        <p className="text-sm text-muted-foreground">Страница настроек в разработке</p>
      </SectionCard>
    </div>
  )
}

export default SettingsPage 