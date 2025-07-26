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

// Массив всех департаментов (пока только LSPD)
export const departmentsData: DepartmentDetails[] = [
  lspdDepartment
];

// Функция для получения департамента по ID
export const getDepartmentById = (id: string | number): DepartmentDetails | undefined => {
  return departmentsData.find(dept => dept.id === id);
};

// Функция для получения департамента по имени
export const getDepartmentByName = (name: string): DepartmentDetails | undefined => {
  return departmentsData.find(dept => dept.name.toLowerCase() === name.toLowerCase());
}; 