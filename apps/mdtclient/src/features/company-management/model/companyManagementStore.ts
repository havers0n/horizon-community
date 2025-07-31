// @ts-nocheck - TODO: Remove after major refactoring is complete
import { create } from 'zustand';
import { MOCK_COMPANIES } from '../../../constants';
import type { 
    CompanyManagementState, 
    CompanyManagementActions, 
    CreateCompanyData, 
    EmploymentData,
    Company 
} from './types';

type CompanyManagementStore = CompanyManagementState & CompanyManagementActions;

export const companyManagementStore = create<CompanyManagementStore>((set, get) => ({
    // State
    companies: MOCK_COMPANIES,
    selectedCompany: null,
    isLoading: false,
    error: null,
    showCreateModal: false,
    showWorkModal: false,
    showDetailsModal: false,

    // Actions
    createCompany: async (data: CreateCompanyData) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newCompany: Company = {
                id: `company_${Date.now()}`,
                ...data,
                status: 'active',
                createdAt: new Date().toISOString(),
            };

            set(state => ({
                companies: [...state.companies, newCompany],
                showCreateModal: false,
                isLoading: false,
            }));
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при создании компании',
                isLoading: false 
            });
        }
    },

    workInCompany: async (data: EmploymentData) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update company employees count
            set(state => ({
                companies: state.companies.map(company => 
                    company.id === data.companyId 
                        ? { ...company, employees: company.employees + 1 }
                        : company
                ),
                showWorkModal: false,
                isLoading: false,
            }));
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при трудоустройстве',
                isLoading: false 
            });
        }
    },

    deleteCompany: async (companyId: string) => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set(state => ({
                companies: state.companies.filter(company => company.id !== companyId),
                selectedCompany: state.selectedCompany?.id === companyId ? null : state.selectedCompany,
                isLoading: false,
            }));
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при удалении компании',
                isLoading: false 
            });
        }
    },

    selectCompany: (company: Company | null) => {
        set({ selectedCompany: company });
    },

    setShowCreateModal: (show: boolean) => {
        set({ showCreateModal: show });
    },

    setShowWorkModal: (show: boolean) => {
        set({ showWorkModal: show });
    },

    setShowDetailsModal: (show: boolean) => {
        set({ showDetailsModal: show });
    },

    loadCompanies: async () => {
        set({ isLoading: true, error: null });
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({ 
                companies: MOCK_COMPANIES,
                isLoading: false 
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Ошибка при загрузке компаний',
                isLoading: false 
            });
        }
    },
}));