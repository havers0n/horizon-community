import { ReactNode } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'

interface PageLayoutProps {
  title: string
  children: ReactNode
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
} 