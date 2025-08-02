// Утилита для отладки ролей пользователя
// В продакшене этот файл должен быть удален

export const RoleDebugger = {
  // Временные роли для тестирования
  testRoles: {
    civilian: ['citizen'],
    leo: ['leo'],
    dispatch: ['dispatch'],
    ems: ['ems'],
    fire: ['fire'],
    admin: ['admin'],
    multiRole: ['leo', 'dispatch', 'admin']
  },

  // Установить тестовую роль
  setTestRole: (roleType: keyof typeof RoleDebugger.testRoles) => {
    const roles = RoleDebugger.testRoles[roleType];
    localStorage.setItem('mdt-test-role', JSON.stringify(roles));
    console.log(`[RoleDebugger] Set test role: ${roleType}`, roles);
    
    // Перезагружаем страницу для применения изменений
    window.location.reload();
  },

  // Получить тестовую роль
  getTestRole: (): string[] => {
    try {
      const testRole = localStorage.getItem('mdt-test-role');
      if (testRole) {
        return JSON.parse(testRole);
      }
    } catch (error) {
      console.error('[RoleDebugger] Error parsing test role:', error);
    }
    return [];
  },

  // Очистить тестовую роль
  clearTestRole: () => {
    localStorage.removeItem('mdt-test-role');
    console.log('[RoleDebugger] Test role cleared');
    window.location.reload();
  },

  // Проверить, активна ли тестовая роль
  isTestRoleActive: (): boolean => {
    return localStorage.getItem('mdt-test-role') !== null;
  }
};

// Добавляем в глобальный объект для доступа из консоли браузера
if (typeof window !== 'undefined') {
  (window as any).RoleDebugger = RoleDebugger;
} 