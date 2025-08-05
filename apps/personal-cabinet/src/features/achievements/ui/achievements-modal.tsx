import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { Trophy, Star, Award, Target } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: 'trophy' | 'star' | 'award' | 'target'
  progress: number
  maxProgress: number
  completed: boolean
  category: string
  reward?: string
}

interface AchievementsModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Первые шаги',
    description: 'Завершите обучение и получите первую должность',
    icon: 'star',
    progress: 100,
    maxProgress: 100,
    completed: true,
    category: 'Обучение',
    reward: 'Значок новичка'
  },
  {
    id: '2',
    title: 'Опытный сотрудник',
    description: 'Проработайте 30 дней в департаменте',
    icon: 'trophy',
    progress: 25,
    maxProgress: 30,
    completed: false,
    category: 'Карьера',
    reward: 'Бонус к зарплате'
  },
  {
    id: '3',
    title: 'Командный игрок',
    description: 'Участвуйте в 50 совместных операциях',
    icon: 'award',
    progress: 35,
    maxProgress: 50,
    completed: false,
    category: 'Командная работа',
    reward: 'Специальная униформа'
  },
  {
    id: '4',
    title: 'Лидер',
    description: 'Проведите 10 успешных операций в качестве руководителя',
    icon: 'target',
    progress: 7,
    maxProgress: 10,
    completed: false,
    category: 'Лидерство',
    reward: 'Повышение в звании'
  }
]

const getIcon = (icon: string) => {
  switch (icon) {
    case 'trophy':
      return <Trophy className="h-6 w-6 text-yellow-500" />
    case 'star':
      return <Star className="h-6 w-6 text-blue-500" />
    case 'award':
      return <Award className="h-6 w-6 text-green-500" />
    case 'target':
      return <Target className="h-6 w-6 text-red-500" />
    default:
      return <Star className="h-6 w-6" />
  }
}

export function AchievementsModal({ children, isOpen, onOpenChange }: AchievementsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const categories = ['all', ...Array.from(new Set(mockAchievements.map(a => a.category)))]
  
  const filteredAchievements = selectedCategory === 'all' 
    ? mockAchievements 
    : mockAchievements.filter(a => a.category === selectedCategory)

  const completedCount = mockAchievements.filter(a => a.completed).length
  const totalCount = mockAchievements.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <Trophy className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Достижения
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Общая статистика */}
          <Card>
            <CardHeader>
              <CardTitle>Прогресс</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  Завершено достижений: {completedCount} из {totalCount}
                </span>
                <Badge variant="secondary">
                  {Math.round((completedCount / totalCount) * 100)}%
                </Badge>
              </div>
              <Progress value={(completedCount / totalCount) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Фильтры по категориям */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Все' : category}
              </Button>
            ))}
          </div>

          {/* Список достижений */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(achievement => (
              <Card key={achievement.id} className={achievement.completed ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(achievement.icon)}
                      <div>
                        <CardTitle className="text-base">{achievement.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    {achievement.completed && (
                      <Badge variant="default" className="bg-green-500">
                        Завершено
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Прогресс</span>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2" 
                    />
                  </div>

                  {achievement.reward && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Награда:</span>
                      <Badge variant="secondary">{achievement.reward}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 