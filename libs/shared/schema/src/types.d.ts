export interface ReportTemplate {
    id: string;
    title: string;
    body: string;
    category: string;
    departmentId: string | null;
    variables: string[];
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: string;
    updatedAt: string;
    isActive?: boolean;
    status?: string;
    purpose?: string;
    estimatedTime?: number;
    whoFills?: string;
    whenUsed?: string;
    subcategory?: string;
}
export interface Report {
    id: string;
    authorId: string;
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
    id: string;
    templateId: string;
    title: string;
    content: string;
    authorId: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    submittedAt?: string;
    supervisorComment?: string;
}
export interface Department {
    id: string;
    name: string;
    fullName: string;
    description: string;
    logoUrl?: string;
    gallery?: string[];
}
export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    rank?: string;
    department?: {
        id: string;
        name: string;
    };
    status?: string;
    createdAt?: string;
}
export interface Complaint {
    id: string;
    authorId: string;
    targetId: string;
    type: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
}
export interface Application {
    id: string;
    type: string;
    status: string;
    data: any;
    createdAt: string;
    updatedAt: string;
    reviewComment?: string;
    author?: {
        id: string;
        username: string;
        rank: string;
        department?: {
            id: string;
            name: string;
        };
    };
}
export interface LeaveApplication {
    id: string;
    type: string;
    status: string;
    data: any;
    createdAt: string;
    updatedAt: string;
    reviewComment?: string;
    author?: {
        id: string;
        username: string;
        rank: string;
        department?: {
            id: string;
            name: string;
        };
    };
}
export interface TransferRequest {
    id: string;
    userId: string;
    fromDepartment: string;
    toDepartment: string;
    reason: string;
    status: 'sent' | 'reviewing' | 'approved' | 'rejected';
    submissionDate: Date;
    reviewDate?: Date;
    reviewerId?: string;
    rejectionReason?: string;
    supervisorComment?: string;
}
export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isRead: boolean;
    createdAt: string;
}
export interface Test {
    id: string;
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
    id: string;
    userId: string;
    username: string;
    testId: string;
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
export interface ForumCategory {
    id: string;
    name: string;
    description: string;
    departmentId: string | null;
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
    id: string;
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
    authorId: string;
    authorUsername: string;
    lastPostAuthorId: string | null;
    lastPostAuthorUsername: string | null;
    categoryId: string;
    categoryName: string;
}
export interface ForumPost {
    id: string;
    content: string;
    isEdited: boolean;
    editedAt: string | null;
    reactionsCount: number;
    createdAt: string;
    authorId: string;
    authorUsername: string;
    parentId: string | null;
}
export interface Call911 {
    id: string;
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
    id: string;
    name: string;
    department: string;
    status: string;
    isPanic: boolean;
    location: {
        x: number;
        y: number;
        z: number;
    };
    characterId: string;
    callsign: string;
}
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
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    department: string;
    author: string;
    date: string;
    likes: number;
}
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: 'general' | 'technical' | 'application' | 'gameplay';
}
