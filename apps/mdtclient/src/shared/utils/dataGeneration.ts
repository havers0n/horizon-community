export class DataGenerator {
  // Генерация SSN (Social Security Number)
  static generateSSN(): string {
    return `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
  
  // Генерация VIN (Vehicle Identification Number)
  static generateVIN(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 17 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  // Генерация серийного номера оружия
  static generateSerialNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  // Генерация номера жетона
  static generateBadgeNumber(): string {
    return Math.floor(Math.random() * 90000) + 10000 + '';
  }
  
  // Генерация номера лицензии
  static generateLicenseNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  // Генерация номера телефона
  static generatePhoneNumber(): string {
    return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
  
  // Генерация номера автомобиля
  static generatePlateNumber(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    const letter1 = letters[Math.floor(Math.random() * letters.length)];
    const letter2 = letters[Math.floor(Math.random() * letters.length)];
    const letter3 = letters[Math.floor(Math.random() * letters.length)];
    const num1 = numbers[Math.floor(Math.random() * numbers.length)];
    const num2 = numbers[Math.floor(Math.random() * numbers.length)];
    const num3 = numbers[Math.floor(Math.random() * numbers.length)];
    
    return `${letter1}${letter2}${letter3} ${num1}${num2}${num3}`;
  }
  
  // Генерация адреса по почтовому коду (асинхронная для будущей интеграции с API)
  static async generateAddressFromPostal(postalCode: string): Promise<string> {
    // Здесь можно интегрировать с API для получения адреса по почтовому коду
    const streets = [
      'Main Street', 'Oak Avenue', 'Pine Road', 'Elm Street', 'Cedar Lane',
      'Maple Drive', 'Washington Boulevard', 'Lincoln Street', 'Park Avenue',
      'Broadway', '5th Avenue', 'Central Park West', 'Madison Avenue'
    ];
    
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    
    return `${number} ${street}, Los Santos, CA ${postalCode}`;
  }
  
  // Генерация случайного цвета
  static generateColor(): string {
    const colors = [
      'Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gray',
      'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gold', 'Navy'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Генерация случайной марки автомобиля
  static generateCarMake(): string {
    const makes = [
      'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Honda',
      'Ford', 'Chevrolet', 'Dodge', 'Nissan', 'Mazda', 'Subaru',
      'Lexus', 'Infiniti', 'Acura', 'Cadillac', 'Lincoln', 'Buick'
    ];
    return makes[Math.floor(Math.random() * makes.length)];
  }
  
  // Генерация случайной модели автомобиля
  static generateCarModel(make: string): string {
    const models: Record<string, string[]> = {
      'BMW': ['X3', 'X5', '3 Series', '5 Series', '7 Series'],
      'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE'],
      'Audi': ['A4', 'A6', 'Q5', 'Q7', 'RS6'],
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Ridgeline'],
      'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Focus']
    };
    
    const makeModels = models[make] || ['Standard', 'Premium', 'Sport'];
    return makeModels[Math.floor(Math.random() * makeModels.length)];
  }
  
  // Генерация случайного типа оружия
  static generateWeaponType(): string {
    const types = [
      'Pistol', 'Revolver', 'Rifle', 'Shotgun', 'SMG', 'Assault Rifle',
      'Sniper Rifle', 'Machine Gun', 'Submachine Gun'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  // Генерация случайного калибра
  static generateCaliber(): string {
    const calibers = [
      '9mm', '.45 ACP', '.40 S&W', '.38 Special', '.357 Magnum',
      '.223 Remington', '.308 Winchester', '.30-06 Springfield',
      '12 Gauge', '.50 BMG'
    ];
    return calibers[Math.floor(Math.random() * calibers.length)];
  }
  
  // Генерация случайного года производства
  static generateYear(minYear: number = 1990, maxYear: number = 2024): number {
    return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  }
  
  // Генерация случайного пробега
  static generateMileage(): number {
    return Math.floor(Math.random() * 200000) + 1000;
  }
} 