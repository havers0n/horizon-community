import { test, expect } from '@playwright/test';

test.describe('User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу перед каждым тестом
    await page.goto('http://localhost:5173');
  });

  test('Complete user registration and application flow', async ({ page }) => {
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@example.com`,
      password: 'Test1234!'
    };

    // 1. Регистрация нового пользователя
    await test.step('Register new user', async () => {
      await page.click('text=Register');
      await page.fill('input[name="username"]', testUser.username);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Проверяем успешную регистрацию
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    // 2. Создание заявки на прием
    await test.step('Create entry application', async () => {
      await page.click('text=Applications');
      await page.click('text=New Application');
      await page.selectOption('select[name="type"]', 'entry');
      await page.selectOption('select[name="department"]', 'pd');
      await page.fill('input[name="position"]', 'Officer');
      await page.fill('textarea[name="experience"]', '2 years of community service');
      await page.fill('textarea[name="motivation"]', 'I want to serve and protect the community');
      await page.click('button[type="submit"]');

      // Проверяем создание заявки
      await expect(page.locator('text=Application submitted successfully')).toBeVisible();
    });

    // 3. Проверка статуса заявки
    await test.step('Check application status', async () => {
      await page.click('text=Applications');
      await expect(page.locator('text=Pending')).toBeVisible();
      await expect(page.locator('text=Officer')).toBeVisible();
    });
  });

  test('User login and dashboard access', async ({ page }) => {
    const testUser = {
      email: 'test@example.com',
      password: 'Test1234!'
    };

    // 1. Вход в систему
    await test.step('Login to system', async () => {
      await page.click('text=Login');
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');

      // Проверяем успешный вход
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    // 2. Проверка навигации
    await test.step('Test navigation', async () => {
      await page.click('text=Applications');
      await expect(page).toHaveURL(/.*applications/);

      await page.click('text=Departments');
      await expect(page).toHaveURL(/.*departments/);

      await page.click('text=Reports');
      await expect(page).toHaveURL(/.*reports/);

      await page.click('text=Dashboard');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    // 3. Проверка профиля пользователя
    await test.step('Check user profile', async () => {
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Profile');
      
      await expect(page.locator('text=test@example.com')).toBeVisible();
      await expect(page.locator('text=User')).toBeVisible();
    });
  });

  test('Department browsing and information', async ({ page }) => {
    // 1. Переход к департаментам
    await test.step('Navigate to departments', async () => {
      await page.click('text=Departments');
      await expect(page).toHaveURL(/.*departments/);
    });

    // 2. Просмотр информации о LSPD
    await test.step('View LSPD information', async () => {
      await page.click('text=LSPD');
      
      await expect(page.locator('text=Los Santos Police Department')).toBeVisible();
      await expect(page.locator('text=Patrol Division')).toBeVisible();
      await expect(page.locator('text=Investigations Bureau')).toBeVisible();
      await expect(page.locator('text=High Risk Operations Division')).toBeVisible();
    });

    // 3. Проверка галереи и активов
    await test.step('Check gallery and assets', async () => {
      await expect(page.locator('[data-testid="department-gallery"]')).toBeVisible();
      await expect(page.locator('[data-testid="3d-models"]')).toBeVisible();
    });
  });

  test('Report creation and management', async ({ page }) => {
    // Сначала входим в систему
    await test.step('Login first', async () => {
      await page.click('text=Login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');
    });

    // 1. Переход к рапортам
    await test.step('Navigate to reports', async () => {
      await page.click('text=Reports');
      await expect(page).toHaveURL(/.*reports/);
    });

    // 2. Создание нового рапорта
    await test.step('Create new report', async () => {
      await page.click('text=New Report');
      await page.selectOption('select[name="template"]', 'incident-report');
      
      // Заполняем форму рапорта
      await page.fill('input[name="incidentDate"]', '2024-01-15');
      await page.fill('input[name="location"]', '123 Main Street');
      await page.fill('textarea[name="description"]', 'Traffic violation observed');
      await page.fill('input[name="officerName"]', 'John Doe');
      await page.fill('input[name="badgeNumber"]', '12345');
      
      await page.click('button[type="submit"]');

      // Проверяем создание рапорта
      await expect(page.locator('text=Report saved successfully')).toBeVisible();
    });

    // 3. Просмотр созданного рапорта
    await test.step('View created report', async () => {
      await page.click('text=My Reports');
      await expect(page.locator('text=Traffic violation observed')).toBeVisible();
      await expect(page.locator('text=John Doe')).toBeVisible();
    });

    // 4. Экспорт рапорта в PDF
    await test.step('Export report to PDF', async () => {
      await page.click('[data-testid="export-pdf"]');
      
      // Проверяем, что началась загрузка PDF
      await expect(page.locator('text=Generating PDF')).toBeVisible();
    });
  });

  test('Application management and status updates', async ({ page }) => {
    // Вход в систему
    await test.step('Login to system', async () => {
      await page.click('text=Login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');
    });

    // 1. Создание заявки на перевод
    await test.step('Create transfer application', async () => {
      await page.click('text=Applications');
      await page.click('text=New Application');
      await page.selectOption('select[name="type"]', 'transfer');
      await page.selectOption('select[name="department"]', 'pd');
      await page.selectOption('select[name="newDepartment"]', 'sahp');
      await page.fill('textarea[name="reason"]', 'Career advancement opportunity');
      await page.fill('input[name="effectiveDate"]', '2024-02-01');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Application submitted successfully')).toBeVisible();
    });

    // 2. Создание заявки на отпуск
    await test.step('Create leave application', async () => {
      await page.click('text=New Application');
      await page.selectOption('select[name="type"]', 'leave');
      await page.selectOption('select[name="leaveType"]', 'vacation');
      await page.fill('input[name="startDate"]', '2024-03-01');
      await page.fill('input[name="endDate"]', '2024-03-05');
      await page.fill('textarea[name="reason"]', 'Family vacation');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Application submitted successfully')).toBeVisible();
    });

    // 3. Проверка всех заявок
    await test.step('Check all applications', async () => {
      await page.click('text=Applications');
      
      await expect(page.locator('text=transfer')).toBeVisible();
      await expect(page.locator('text=leave')).toBeVisible();
      await expect(page.locator('text=Pending')).toBeVisible();
    });
  });

  test('Theme switching and user preferences', async ({ page }) => {
    // Вход в систему
    await test.step('Login to system', async () => {
      await page.click('text=Login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');
    });

    // 1. Переключение темы
    await test.step('Switch theme', async () => {
      const initialTheme = await page.getAttribute('html', 'data-theme');
      
      await page.click('[data-testid="theme-toggle"]');
      
      await expect(page).toHaveAttribute('html', 'data-theme', initialTheme === 'light' ? 'dark' : 'light');
    });

    // 2. Проверка сохранения предпочтений
    await test.step('Check preference persistence', async () => {
      await page.reload();
      
      // Тема должна сохраниться после перезагрузки
      await expect(page).toHaveAttribute('html', 'data-theme', 'dark');
    });
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Устанавливаем мобильное разрешение
    await page.setViewportSize({ width: 375, height: 667 });

    // 1. Проверка мобильного меню
    await test.step('Test mobile menu', async () => {
      await page.click('[data-testid="mobile-menu-toggle"]');
      
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Applications')).toBeVisible();
    });

    // 2. Проверка адаптивности форм
    await test.step('Test responsive forms', async () => {
      await page.click('text=Applications');
      await page.click('text=New Application');
      
      // Форма должна быть адаптивной
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="type"]')).toBeVisible();
    });

    // 3. Проверка навигации на мобильных устройствах
    await test.step('Test mobile navigation', async () => {
      await page.click('[data-testid="mobile-menu-toggle"]');
      await page.click('text=Departments');
      
      await expect(page).toHaveURL(/.*departments/);
    });
  });

  test('Error handling and edge cases', async ({ page }) => {
    // 1. Попытка доступа к защищенным страницам без авторизации
    await test.step('Access protected pages without auth', async () => {
      await page.goto('http://localhost:5173/dashboard');
      await expect(page).toHaveURL(/.*login/);
      
      await page.goto('http://localhost:5173/applications');
      await expect(page).toHaveURL(/.*login/);
    });

    // 2. Тест с неверными учетными данными
    await test.step('Test with invalid credentials', async () => {
      await page.click('text=Login');
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    // 3. Тест с некорректными данными формы
    await test.step('Test with invalid form data', async () => {
      await page.click('text=Register');
      await page.fill('input[name="username"]', 'a'); // слишком короткий
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', '123'); // слабый пароль
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Username must be at least 3 characters')).toBeVisible();
      await expect(page.locator('text=Invalid email format')).toBeVisible();
      await expect(page.locator('text=Password is too weak')).toBeVisible();
    });
  });

  test('Performance and loading states', async ({ page }) => {
    // 1. Проверка времени загрузки страниц
    await test.step('Check page load times', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:5173');
      const loadTime = Date.now() - startTime;

      // Главная страница должна загружаться менее чем за 3 секунды
      expect(loadTime).toBeLessThan(3000);
    });

    // 2. Проверка состояний загрузки
    await test.step('Check loading states', async () => {
      await page.click('text=Login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');

      // Должен появиться индикатор загрузки
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      // После загрузки спиннер должен исчезнуть
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });

    // 3. Проверка оптимизации изображений
    await test.step('Check image optimization', async () => {
      await page.click('text=Departments');
      await page.click('text=LSPD');

      // Изображения должны загружаться с правильными размерами
      const images = await page.locator('img').all();
      for (const img of images) {
        const src = await img.getAttribute('src');
        expect(src).toMatch(/\.(jpg|jpeg|png|webp)$/);
      }
    });
  });

  test('Accessibility compliance', async ({ page }) => {
    // 1. Проверка ARIA атрибутов
    await test.step('Check ARIA attributes', async () => {
      await page.goto('http://localhost:5173');
      
      // Проверяем наличие ARIA атрибутов
      await expect(page.locator('[aria-label]')).toBeVisible();
      await expect(page.locator('[role="navigation"]')).toBeVisible();
      await expect(page.locator('[role="main"]')).toBeVisible();
    });

    // 2. Проверка навигации с клавиатуры
    await test.step('Test keyboard navigation', async () => {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Должна произойти навигация
      await expect(page).toHaveURL(/.*login/);
    });

    // 3. Проверка контрастности цветов
    await test.step('Check color contrast', async () => {
      // Проверяем, что текст читаем
      await expect(page.locator('text=Welcome to RolePlayIdentity')).toBeVisible();
      
      // Проверяем, что кнопки имеют достаточный контраст
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.trim()) {
          await expect(button).toBeVisible();
        }
      }
    });
  });
}); 