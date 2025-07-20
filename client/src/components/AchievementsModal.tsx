import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Users, 
  FileText, 
  Calendar,
  Zap,
  Crown,
  Gem,
  Shield,
  Flame
} from "lucide-react";

interface AchievementsModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isCompleted: boolean;
  progress: number;
  progressRequired: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
  awardedAt: string;
  reason?: string;
}

interface UserStats {
  level: number;
  experience: number;
  totalPoints: number;
  applicationsSubmitted: number;
  applicationsApproved: number;
  reportsSubmitted: number;
  reportsApproved: number;
  complaintsSubmitted: number;
  daysActive: number;
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    trophy: Trophy,
    award: Award,
    star: Star,
    target: Target,
    users: Users,
    fileText: FileText,
    calendar: Calendar,
    zap: Zap,
    crown: Crown,
    gem: Gem,
    shield: Shield,
    flame: Flame,
  };
  return icons[iconName] || Trophy;
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'rare': return 'bg-blue-500';
    case 'epic': return 'bg-purple-500';
    case 'legendary': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'activity': return 'bg-green-100 text-green-800';
    case 'skill': return 'bg-blue-100 text-blue-800';
    case 'social': return 'bg-purple-100 text-purple-800';
    case 'special': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function AchievementsModal({ children, isOpen, onOpenChange }: AchievementsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    enabled: open
  });

  const { data: badges = [] } = useQuery<Badge[]>({
    queryKey: ['/api/badges'],
    enabled: open
  });

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/user-stats'],
    enabled: open
  });

  const completedAchievements = achievements.filter(a => a.isCompleted);
  const inProgressAchievements = achievements.filter(a => !a.isCompleted && a.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.isCompleted && a.progress === 0);

  const experienceToNextLevel = stats ? Math.pow(stats.level + 1, 2) * 100 - stats.experience : 0;
  const progressToNextLevel = stats ? (stats.experience / Math.pow(stats.level + 1, 2) / 100) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Trophy className="h-4 w-4" />
            Достижения
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Достижения и награды</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
            <TabsTrigger value="badges">Бейджи</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Уровень и опыт */}
            {stats && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span>Уровень {stats.level}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Опыт: {stats.experience}</span>
                      <span>До следующего уровня: {experienceToNextLevel}</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Всего очков:</span> {stats.totalPoints}
                    </div>
                    <div>
                      <span className="font-medium">Дней активности:</span> {stats.daysActive}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Быстрая статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="card-hover">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">{completedAchievements.length}</div>
                  <div className="text-sm text-gray-600">Достижений</div>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{badges.length}</div>
                  <div className="text-sm text-gray-600">Бейджей</div>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{stats?.applicationsApproved || 0}</div>
                  <div className="text-sm text-gray-600">Одобренных заявок</div>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{stats?.reportsApproved || 0}</div>
                  <div className="text-sm text-gray-600">Одобренных рапортов</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid gap-4">
              {achievements.map((achievement) => {
                const IconComponent = getIconComponent(achievement.icon);
                const progress = (achievement.progress / achievement.progressRequired) * 100;
                
                return (
                  <Card key={achievement.id} className={`card-hover ${achievement.isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${achievement.isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <IconComponent className={`h-6 w-6 ${achievement.isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{achievement.name}</h3>
                            {achievement.isCompleted && (
                              <Badge className="bg-green-100 text-green-800">Завершено</Badge>
                            )}
                            <Badge className={getCategoryColor(achievement.category)}>
                              {achievement.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          
                          {!achievement.isCompleted && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Прогресс: {achievement.progress}/{achievement.progressRequired}</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{achievement.points} очков</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="grid gap-4">
              {badges.map((badge) => {
                const IconComponent = getIconComponent(badge.icon);
                
                return (
                  <Card key={badge.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${getRarityColor(badge.rarity)}`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{badge.name}</h3>
                            <Badge className={getRarityColor(badge.rarity)}>
                              {badge.rarity}
                            </Badge>
                            <Badge variant="outline">
                              {badge.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                          
                          <div className="text-xs text-gray-500">
                            Получен: {new Date(badge.awardedAt).toLocaleDateString()}
                            {badge.reason && (
                              <span className="block mt-1">Причина: {badge.reason}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Активность</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.applicationsSubmitted}</div>
                        <div className="text-sm text-gray-600">Заявок подано</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.applicationsApproved}</div>
                        <div className="text-sm text-gray-600">Заявок одобрено</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.reportsSubmitted}</div>
                        <div className="text-sm text-gray-600">Рапортов подано</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.reportsApproved}</div>
                        <div className="text-sm text-gray-600">Рапортов одобрено</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 