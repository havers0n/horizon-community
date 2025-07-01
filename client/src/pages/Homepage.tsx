import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Award, Clock, Star, Search, Filter } from "lucide-react";
import { Department } from "@shared/schema";

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
  averageResponseTime: "24 hours"
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
  }
];

export default function Homepage() {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Los Santos CAD System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional roleplay management system for law enforcement, fire department, 
            and emergency medical services. Join our community today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Users className="h-5 w-5" />
                Join Community
              </Button>
            </Link>
            <Link href="/departments">
              <Button size="lg" variant="outline" className="gap-2">
                <Shield className="h-5 w-5" />
                View Departments
              </Button>
            </Link>
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
                <p className="text-muted-foreground">Active Members</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-3xl font-bold mb-2">{mockStats.activeDepartments}</div>
                <p className="text-muted-foreground">Departments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <div className="text-3xl font-bold mb-2">{mockStats.totalApplications.toLocaleString()}</div>
                <p className="text-muted-foreground">Applications Processed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <div className="text-3xl font-bold mb-2">{mockStats.averageResponseTime}</div>
                <p className="text-muted-foreground">Avg Response Time</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Departments</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join one of our professional departments and start your roleplay career in Los Santos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>{dept.fullName}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {dept.description}
                  </p>
                  <Link href={`/departments`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Gallery */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Community Gallery</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore highlights from our community activities, training exercises, and memorable moments.
            </p>
          </div>

          {/* Gallery Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
                <SelectItem value="Multi-Agency">Multi-Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Shield className="h-16 w-16 text-white/50" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{item.department}</Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {item.author}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{item.likes}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGallery.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Career?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of players in Los Santos' most professional roleplay community. 
            Choose your path and make a difference.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                <Users className="h-5 w-5" />
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Shield className="h-5 w-5" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}