import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Users, 
  Award, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  MessageCircle, 
  ExternalLink,
  Heart,
  Calendar,
  MapPin
} from "lucide-react";
import { Department } from "@shared/schema";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { VKIcon } from "@/components/ui/VKIcon";

interface CommunityStats {
  totalMembers: number;
  activeDepartments: number;
  totalApplications: number;
  averageResponseTime: string;
}

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  department: string;
  author: string;
  date: string;
  likes: number;
}

const mockStats: CommunityStats = {
  totalMembers: 1247,
  activeDepartments: 4,
  totalApplications: 2891,
  averageResponseTime: "1 час"
};

const mockGallery: GalleryItem[] = [
  {
    id: 1,
    title: "High-Speed Pursuit Training",
    description: "LSPD conducts advanced pursuit training at the Sandy Shores Airfield",
    imageUrl: "/gallery/pursuit-training.jpg",
    department: "LSPD",
    author: "Officer Johnson",
    date: "2025-01-01",
    likes: 45
  },
  {
    id: 2,
    title: "Medical Emergency Response",
    description: "EMS team responding to a multi-vehicle accident on the highway",
    imageUrl: "/gallery/ems-response.jpg",
    department: "EMS",
    author: "Paramedic Smith",
    date: "2024-12-30",
    likes: 32
  },
  {
    id: 3,
    title: "Fire Department Rescue Operation",
    description: "LSFD conducting a technical rescue training exercise",
    imageUrl: "/gallery/fire-rescue.jpg",
    department: "LSFD",
    author: "Captain Rodriguez",
    date: "2024-12-28",
    likes: 67
  },
  {
    id: 4,
    title: "Joint Department Exercise",
    description: "Multi-agency response drill involving LSPD, LSFD, and EMS",
    imageUrl: "/gallery/joint-exercise.jpg",
    department: "Multi-Agency",
    author: "Chief Williams",
    date: "2024-12-25",
    likes: 89
  },
  {
    id: 5,
    title: "BCSO Patrol Training",
    description: "Blaine County Sheriff's Office conducting rural patrol training",
    imageUrl: "/gallery/bcso-patrol.jpg",
    department: "BCSO",
    author: "Deputy Martinez",
    date: "2024-12-20",
    likes: 38
  },
  {
    id: 6,
    title: "Dispatch Center Operations",
    description: "Our dispatch team managing emergency calls during peak hours",
    imageUrl: "/gallery/dispatch-center.jpg",
    department: "DD",
    author: "Dispatcher Davis",
    date: "2024-12-18",
    likes: 52
  }
];

export default function Homepage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Fetch departments for filtering
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments']
  });

  // Filter gallery items
  const filteredGallery = mockGallery.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || 
                             item.department === selectedDepartment ||
                             (selectedDepartment === "Multi-Agency" && item.department === "Multi-Agency");
    
    return matchesSearch && matchesDepartment;
  });

  const handleDiscordClick = () => {
    window.open('https://discord.gg/your-server', '_blank');
  };

  const handleVKClick = () => {
    window.open('https://vk.com/your-group', '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Horizon Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Здесь твоя роль важна!<br />
            Полиция, пожарные, медики — всё для яркой игры и карьерного роста. Вступай в комьюнити нового поколения!
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                <Users className="h-5 w-5" />
                {t('homepage.join', 'Присоединиться')}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="gap-2">
                <Shield className="h-5 w-5" />
                {t('homepage.login', 'Войти в личный кабинет')}
              </Button>
            </Link>
          </div>
          
          {/* Social Media Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleDiscordClick}
              variant="outline" 
              size="lg" 
              className="gap-2 bg-[#5865F2] text-white hover:bg-[#4752C4] border-[#5865F2]"
            >
              <DiscordIcon className="h-5 w-5" />
              Наш Discord
            </Button>
            <Button 
              onClick={handleVKClick}
              variant="outline" 
              size="lg" 
              className="gap-2 bg-[#4C75A3] text-white hover:bg-[#3B5998] border-[#4C75A3]"
            >
              <VKIcon className="h-5 w-5" />
              Группа ВК
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold mb-2">{mockStats.totalMembers.toLocaleString()}</div>
                <p className="text-muted-foreground">{t('homepage.active_members', 'Активных участников')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-3xl font-bold mb-2">6</div>
                <p className="text-muted-foreground">Департаментов</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <div className="text-3xl font-bold mb-2">{mockStats.totalApplications.toLocaleString()}</div>
                <p className="text-muted-foreground">{t('homepage.applications_processed', 'Обработано заявок')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <div className="text-3xl font-bold mb-2">{mockStats.averageResponseTime}</div>
                <p className="text-muted-foreground">Среднее время ответа</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('homepage.our_departments', 'Наши департаменты')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('homepage.departments_subtitle', 'Присоединитесь к одному из наших профессиональных департаментов и начните свою ролевую карьеру в Лос-Сантосе.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    {dept.logoUrl ? (
                      <img src={dept.logoUrl} alt={dept.name} className="w-12 h-12 object-contain" />
                    ) : (
                      <Shield className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{dept.name}</CardTitle>
                  <CardDescription className="text-base">{dept.fullName}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                    {dept.description}
                  </p>
                  <div className="space-y-3">
                    <Link href={`/departments`}>
                      <Button variant="outline" size="sm" className="w-full">
                        {t('homepage.learn_more', 'Узнать больше')}
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="w-full">
                        {t('homepage.apply_now', 'Подать заявку')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Галерея сообщества</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Посмотрите на лучшие моменты из жизни нашего сообщества. Скриншоты и фотографии с активных смен, тренировок и мероприятий.
            </p>
          </div>

          {/* Gallery Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Поиск по галерее..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Все департаменты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все департаменты</SelectItem>
                  <SelectItem value="LSPD">LSPD</SelectItem>
                  <SelectItem value="BCSO">BCSO</SelectItem>
                  <SelectItem value="LSFD">LSFD</SelectItem>
                  <SelectItem value="EMS">EMS</SelectItem>
                  <SelectItem value="DD">DD</SelectItem>
                  <SelectItem value="Multi-Agency">Совместные операции</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Shield className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">{item.title}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{item.department}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>{item.likes}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Автор: {item.author}</span>
                    <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGallery.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">По вашему запросу ничего не найдено</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы присоединиться к нам?</h2>
          <p className="text-xl mb-8 opacity-90">
            Станьте частью профессионального ролевого сообщества и начните свою карьеру в Лос-Сантосе
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                <Users className="h-5 w-5" />
                Подать заявку
              </Button>
            </Link>
            <Button 
              onClick={handleDiscordClick}
              size="lg" 
              variant="outline" 
              className="gap-2 border-white text-white hover:bg-white hover:text-blue-600"
            >
              <DiscordIcon className="h-5 w-5" />
              Присоединиться к Discord
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}