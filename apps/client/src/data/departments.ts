// Расширенные интерфейсы для департаментов
export interface Division {
  id: string;
  name: string;
  description?: string;
}

export interface Asset {
  type: '3d-model' | 'image' | 'video';
  url: string;
  description?: string;
}

export interface DepartmentDetails {
  id: string | number;
  name: string;
  fullName: string;
  description: string;
  logoUrl?: string;
  gallery?: string[];
  divisions?: Division[];
  assets?: Asset[];
  head?: string;
  contacts?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  stats?: {
    totalOfficers?: number;
    activeUnits?: number;
    responseTime?: string;
  };
}

// Данные для LSPD (PD)
export const lspdDepartment: DepartmentDetails = {
  id: "pd",
  name: "LSPD",
  fullName: "Los Santos Police Department",
  description: "LSPD — главный правоохранительный орган Лос-Сантоса, отвечающий за поддержание порядка, расследование преступлений и обеспечение безопасности граждан. Департамент работает круглосуточно, обеспечивая защиту жителей города от преступности и поддержание правопорядка.",
  logoUrl: "/assets/lspd_logo.png",
  gallery: [
    "/assets/lspd_gallery1.jpg",
    "/assets/lspd_gallery2.jpg",
    "/assets/lspd_gallery3.jpg"
  ],
  divisions: [
    {
      id: "patrol",
      name: "Patrol Division",
      description: "Патрульное подразделение, отвечающее за патрулирование улиц, реагирование на вызовы и поддержание видимого присутствия полиции в городе."
    },
    {
      id: "investigations",
      name: "Investigations Bureau",
      description: "Бюро расследований, занимающееся раскрытием сложных преступлений, сбором улик и проведением детективных операций."
    },
    {
      id: "hrod",
      name: "High Risk Operations Division (HROD)",
      description: "Подразделение высокорисковых операций, специализирующееся на особо опасных ситуациях, задержании вооруженных преступников и антитеррористических операциях."
    },
    {
      id: "traffic",
      name: "Traffic Division",
      description: "Подразделение дорожного движения, контролирующее соблюдение правил дорожного движения и расследующее ДТП."
    },
    {
      id: "k9",
      name: "K-9 Unit",
      description: "Кинологическое подразделение, использующее служебных собак для поиска наркотиков, взрывчатки и задержания преступников."
    }
  ],
  assets: [
    {
      type: "3d-model",
      url: "/assets/3dmodels/lspd_cruiser.glb",
      description: "3D-модель патрульной машины LSPD"
    },
    {
      type: "3d-model",
      url: "/assets/3dmodels/lspd_swat_van.glb",
      description: "3D-модель SWAT фургона"
    },
    {
      type: "image",
      url: "/assets/equipment/lspd_taser.jpg",
      description: "Электрошокер, используемый сотрудниками LSPD"
    },
    {
      type: "image",
      url: "/assets/equipment/lspd_vest.jpg",
      description: "Бронежилет стандартного образца"
    },
    {
      type: "video",
      url: "/assets/videos/lspd_training.mp4",
      description: "Видео тренировки сотрудников LSPD"
    }
  ],
  head: "Chief of Police Michael Johnson",
  contacts: {
    phone: "+1 (555) 123-4567",
    email: "info@lspd.gov",
    address: "Mission Row Police Station, Los Santos"
  },
  stats: {
    totalOfficers: 150,
    activeUnits: 25,
    responseTime: "3-5 минут"
  }
};

// Импортируем новый сервис для работы с API
import { departmentsService, Department } from '../services/departmentsService';

// Массив всех департаментов (пока только LSPD)
export const departmentsData: DepartmentDetails[] = [
  lspdDepartment
];

// Функция для получения департамента по ID (использует новый API)
export const getDepartmentById = async (id: string | number): Promise<DepartmentDetails | undefined> => {
  try {
    const apiDepartment = await departmentsService.getDepartmentById(id.toString());
    if (apiDepartment) {
      // Преобразуем API формат в локальный формат
      return {
        id: apiDepartment.id,
        name: apiDepartment.name,
        fullName: apiDepartment.full_name,
        description: apiDepartment.description || '',
        logoUrl: apiDepartment.logo_url,
        gallery: apiDepartment.gallery || []
      };
    }
  } catch (error) {
    console.error('[getDepartmentById] Ошибка при получении департамента из API:', error);
  }
  
  // Fallback на локальные данные
  return departmentsData.find(dept => dept.id === id);
};

// Функция для получения департамента по имени (использует новый API)
export const getDepartmentByName = async (name: string): Promise<DepartmentDetails | undefined> => {
  try {
    const allDepartments = await departmentsService.getAllDepartments();
    const apiDepartment = allDepartments.find(dept => 
      dept.name.toLowerCase() === name.toLowerCase()
    );
    
    if (apiDepartment) {
      // Преобразуем API формат в локальный формат
      return {
        id: apiDepartment.id,
        name: apiDepartment.name,
        fullName: apiDepartment.full_name,
        description: apiDepartment.description || '',
        logoUrl: apiDepartment.logo_url,
        gallery: apiDepartment.gallery || []
      };
    }
  } catch (error) {
    console.error('[getDepartmentByName] Ошибка при получении департамента из API:', error);
  }
  
  // Fallback на локальные данные
  return departmentsData.find(dept => dept.name.toLowerCase() === name.toLowerCase());
};

// Функция для получения всех департаментов (использует новый API)
export const getAllDepartments = async (): Promise<DepartmentDetails[]> => {
  try {
    const apiDepartments = await departmentsService.getAllDepartments();
    return apiDepartments.map(apiDept => ({
      id: apiDept.id,
      name: apiDept.name,
      fullName: apiDept.full_name,
      description: apiDept.description || '',
      logoUrl: apiDept.logo_url,
      gallery: apiDept.gallery || []
    }));
  } catch (error) {
    console.error('[getAllDepartments] Ошибка при получении департаментов из API:', error);
    // Fallback на локальные данные
    return departmentsData;
  }
}; 