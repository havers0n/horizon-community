// Типы для отчетов
export interface ReportTemplate {
  id: number;
  title: string;
  body: string;
  category: string;
  departmentId: number | null;
  variables: string[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
  // Дополнительные поля для совместимости
  isActive?: boolean;
  status?: string;
  purpose?: string;
  estimatedTime?: number;
  whoFills?: string;
  whenUsed?: string;
  subcategory?: string;
}

export interface Report {
  id: number;
  authorId: number;
  status: string;
  fileUrl: string;
  supervisorComment: string | null;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  content?: string;
  type?: string;
}

export interface FilledReport {
  id: number;
  templateId: number;
  title: string;
  content: string;
  authorId: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  // Дополнительные поля для совместимости
  submittedAt?: string;
  supervisorComment?: string;
}

// Типы для департаментов
export interface Department {
  id: number;
  name: string;
  fullName: string;
  description: string;
  logoUrl?: string;
  gallery?: string[];
}

// Типы для пользователей
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  rank?: string;
  department?: {
    id: number;
    name: string;
  };
  // Дополнительные поля для совместимости
  status?: string;
  createdAt?: string;
}

// Типы для жалоб
export interface Complaint {
  id: number;
  authorId: number;
  targetId: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// Типы для заявок
export interface Application {
  id: number;
  type: string;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  reviewComment?: string;
  author?: {
    id: number;
    username: string;
    rank: string;
    department?: {
      id: number;
      name: string;
    };
  };
}

// Типы для отпусков
export interface LeaveApplication {
  id: number;
  type: string;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  reviewComment?: string;
  author?: {
    id: number;
    username: string;
    rank: string;
    department?: {
      id: number;
      name: string;
    };
  };
}

// Типы для переводов
export interface TransferRequest {
  id: number;
  userId: number;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  status: 'sent' | 'reviewing' | 'approved' | 'rejected';
  submissionDate: Date;
  reviewDate?: Date;
  reviewerId?: number;
  rejectionReason?: string;
  supervisorComment?: string;
}

// Типы для уведомлений
export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isRead: boolean;
  createdAt: string;
}

// Типы для тестов
export interface Test {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  questionsCount: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: string;
  totalAttempts: number;
  passRate: number;
  questions?: any[];
}

export interface TestResult {
  id: number;
  userId: number;
  username: string;
  testId: number;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  focusLostCount: number;
  warningsCount: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  results?: any;
}

// Типы для форума
export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  departmentId: number | null;
  icon: string;
  color: string;
  orderIndex: number;
  isActive: boolean;
  topicsCount: number;
  postsCount: number;
  lastActivity: string | null;
  departmentName: string | null;
}

export interface ForumTopic {
  id: number;
  title: string;
  content: string;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  viewsCount: number;
  repliesCount: number;
  lastPostAt: string | null;
  tags: string[];
  createdAt: string;
  authorId: number;
  authorUsername: string;
  lastPostAuthorId: number | null;
  lastPostAuthorUsername: string | null;
  categoryId: number;
  categoryName: string;
}

export interface ForumPost {
  id: number;
  content: string;
  isEdited: boolean;
  editedAt: string | null;
  reactionsCount: number;
  createdAt: string;
  authorId: number;
  authorUsername: string;
  parentId: number | null;
}

// Типы для CAD
export interface Call911 {
  id: number;
  caller: string;
  location: string;
  description: string;
  priority: number;
  status: 'pending' | 'active' | 'closed';
  type: 'police' | 'fire' | 'ems';
  createdAt: string;
  callerInfo?: any;
  attachments?: any[];
}

export interface Unit {
  id: number;
  name: string;
  department: string;
  status: string;
  isPanic: boolean;
  location: { x: number; y: number; z: number };
  characterId: number;
  callsign: string;
}

// Типы для статистики
export interface Stats {
  totalUsers: number;
  pendingApplications: number;
  activeDepartments: number;
  openTickets: number;
}

export interface CommunityStats {
  totalMembers: number;
  activeDepartments: number;
  totalApplications: number;
  averageResponseTime: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  department: string;
  author: string;
  date: string;
  likes: number;
}

// Типы для FAQ
export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'application' | 'gameplay';
} 