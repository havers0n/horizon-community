import { Router } from 'express';
import { publicService } from '../services/PublicService';

const router = Router();

/**
 * @route GET /api/public/departments
 * @desc Получить список всех департаментов (публичный доступ)
 * @access Public
 */
router.get('/departments', async (req, res) => {
  try {
    console.log('[PublicAPI] 🔍 Запрос списка департаментов...');
    
    const departments = await publicService.getAllDepartments();
    
    console.log(`[PublicAPI] ✅ Возвращено ${departments.length} департаментов`);
    
    res.json({
      success: true,
      data: departments,
      count: departments.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[PublicAPI] ❌ Ошибка при получении департаментов:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/public/departments/:id
 * @desc Получить департамент по ID (публичный доступ)
 * @access Public
 */
router.get('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[PublicAPI] 🔍 Запрос департамента с ID: ${id}`);
    
    const department = await publicService.getDepartmentById(id);
    
    if (!department) {
      console.log(`[PublicAPI] ❌ Департамент с ID ${id} не найден`);
      return res.status(404).json({
        success: false,
        error: 'Department not found',
        message: `Department with ID ${id} not found`,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`[PublicAPI] ✅ Департамент ${id} найден`);
    
    res.json({
      success: true,
      data: department,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[PublicAPI] ❌ Ошибка при получении департамента:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/public/health
 * @desc Проверка здоровья публичного API
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    console.log('[PublicAPI] 🔍 Health check...');
    
    const health = await publicService.healthCheck();
    
    console.log('[PublicAPI] ✅ Health check passed');
    
    res.json({
      success: true,
      ...health,
      service: 'public-api'
    });
    
  } catch (error) {
    console.error('[PublicAPI] ❌ Health check failed:', error);
    
    res.status(503).json({
      success: false,
      status: 'error',
      error: 'Service unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      service: 'public-api'
    });
  }
});

export default router; 