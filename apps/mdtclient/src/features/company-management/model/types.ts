export interface Company {
    id: string;
    name: string;
    industry: string;
    type: string;
    address: string;
    phone: string;
    email: string;
    ceo: string;
    employees: number;
    founded: string;
    description: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface EmploymentData {
    companyId: string;
    position: string;
    salary: number;
    startDate: string;
    endDate?: string;
    status: 'active' | 'terminated';
}

export interface CreateCompanyData {
    name: string;
    industry: string;
    type: string;
    address: string;
    phone: string;
    email: string;
    ceo: string;
    employees: number;
    founded: string;
    description: string;
}

export interface CompanyManagementState {
    companies: Company[];
    selectedCompany: Company | null;
    isLoading: boolean;
    error: string | null;
    showCreateModal: boolean;
    showWorkModal: boolean;
    showDetailsModal: boolean;
}

export interface CompanyManagementActions {
    createCompany: (data: CreateCompanyData) => Promise<void>;
    workInCompany: (data: EmploymentData) => Promise<void>;
    deleteCompany: (companyId: string) => Promise<void>;
    selectCompany: (company: Company | null) => void;
    setShowCreateModal: (show: boolean) => void;
    setShowWorkModal: (show: boolean) => void;
    setShowDetailsModal: (show: boolean) => void;
    loadCompanies: () => Promise<void>;
}