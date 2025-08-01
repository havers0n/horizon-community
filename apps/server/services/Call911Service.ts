import { SupabaseStorage } from './SupabaseStorage';
import { 
  Call911, 
  InsertCall911, 
  UpdateCall911,
  ActiveUnit,
  InsertActiveUnit,
  UpdateActiveUnit,
  CallAttachment,
  InsertCallAttachment,
  UnitStatus
} from '@roleplay-identity/shared-types';

export class Call911Service {
  private storage: SupabaseStorage;

  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ
  // ===========================================

  async createCall(data: InsertCall911): Promise<Call911> {
    return this.storage.insert('call911', data);
  }

  async getCallById(id: string): Promise<Call911 | null> {
    return this.storage.getById('call911', id);
  }

  async getAllCalls(): Promise<Call911[]> {
    return this.storage.list('call911');
  }

  async getCallsByStatus(status: Call911['status']): Promise<Call911[]> {
    return this.storage.list('call911', { status });
  }

  async getCallsByPriority(priority: Call911['priority']): Promise<Call911[]> {
    return this.storage.list('call911', { priority });
  }

  async getActiveCalls(): Promise<Call911[]> {
    return this.storage.list('call911', { 
      status: { in: ['pending', 'dispatched', 'en_route', 'on_scene'] }
    });
  }

  async updateCall(id: string, data: UpdateCall911): Promise<Call911> {
    return this.storage.update('call911', id, data);
  }

  async deleteCall(id: string): Promise<void> {
    await this.storage.delete('call911', id);
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА
  // ===========================================

  async dispatchCall(id: string, assignedUnits: string[]): Promise<Call911> {
    const call = await this.getCallById(id);
    if (!call) {
      throw new Error('Вызов не найден');
    }

    if (call.status !== 'pending') {
      throw new Error('Вызов уже обработан');
    }

    // Обновляем статус вызова
    const updatedCall = await this.updateCall(id, {
      status: 'dispatched',
      assignedUnits
    });

    // Обновляем статус назначенных юнитов
    await Promise.all(
      assignedUnits.map(unitId =>
        this.updateUnitStatus(unitId, UnitStatus.EN_ROUTE, id)
      )
    );

    return updatedCall;
  }

  async updateCallStatus(
    id: string, 
    status: Call911['status'],
    unitId?: string
  ): Promise<Call911> {
    const call = await this.getCallById(id);
    if (!call) {
      throw new Error('Вызов не найден');
    }

    const updatedCall = await this.updateCall(id, { status });

    // Если указан юнит, обновляем его статус
    if (unitId) {
      let unitStatus: UnitStatus;
      switch (status) {
        case 'en_route':
          unitStatus = UnitStatus.EN_ROUTE;
          break;
        case 'on_scene':
          unitStatus = UnitStatus.ON_SCENE;
          break;
        case 'completed':
          unitStatus = UnitStatus.AVAILABLE;
          break;
        default:
          unitStatus = UnitStatus.AVAILABLE;
      }

      await this.updateUnitStatus(unitId, unitStatus, id);
    }

    return updatedCall;
  }

  async assignUnitToCall(callId: string, unitId: string): Promise<Call911> {
    const call = await this.getCallById(callId);
    if (!call) {
      throw new Error('Вызов не найден');
    }

    const currentUnits = call.assignedUnits || [];
    if (currentUnits.includes(unitId)) {
      throw new Error('Юнит уже назначен на этот вызов');
    }

    const updatedUnits = [...currentUnits, unitId];
    return this.updateCall(callId, { assignedUnits: updatedUnits });
  }

  async removeUnitFromCall(callId: string, unitId: string): Promise<Call911> {
    const call = await this.getCallById(callId);
    if (!call) {
      throw new Error('Вызов не найден');
    }

    const currentUnits = call.assignedUnits || [];
    const updatedUnits = currentUnits.filter(id => id !== unitId);

    return this.updateCall(callId, { assignedUnits: updatedUnits });
  }

  async completeCall(id: string): Promise<Call911> {
    const call = await this.getCallById(id);
    if (!call) {
      throw new Error('Вызов не найден');
    }

    // Освобождаем все назначенные юниты
    if (call.assignedUnits && call.assignedUnits.length > 0) {
      await Promise.all(
        call.assignedUnits.map(unitId =>
          this.updateUnitStatus(unitId, UnitStatus.AVAILABLE)
        )
      );
    }

    return this.updateCall(id, { status: 'completed' });
  }

  async cancelCall(id: string, reason?: string): Promise<Call911> {
    const call = await this.getCallById(id);
    if (!call) {
      throw new Error('Вызов не найден');
    }

    // Освобождаем все назначенные юниты
    if (call.assignedUnits && call.assignedUnits.length > 0) {
      await Promise.all(
        call.assignedUnits.map(unitId =>
          this.updateUnitStatus(unitId, UnitStatus.AVAILABLE)
        )
      );
    }

    return this.updateCall(id, { 
      status: 'cancelled',
      description: reason ? `${call.description}\n[ОТМЕНЕН: ${reason}]` : call.description
    });
  }

  // ===========================================
  // АКТИВНЫЕ ЮНИТЫ
  // ===========================================

  async createActiveUnit(data: InsertActiveUnit): Promise<ActiveUnit> {
    return this.storage.insert('active_units', data);
  }

  async getActiveUnitById(id: string): Promise<ActiveUnit | null> {
    return this.storage.getById('active_units', id);
  }

  async getActiveUnitsByCharacter(characterId: string): Promise<ActiveUnit[]> {
    return this.storage.list('active_units', { characterId, isActive: true });
  }

  async getAllActiveUnits(): Promise<ActiveUnit[]> {
    return this.storage.list('active_units', { isActive: true });
  }

  async updateActiveUnit(id: string, data: UpdateActiveUnit): Promise<ActiveUnit> {
    return this.storage.update('active_units', id, data);
  }

  async deleteActiveUnit(id: string): Promise<void> {
    await this.storage.update('active_units', id, { isActive: false });
  }

  async updateUnitStatus(
    unitId: string, 
    status: UnitStatus, 
    callId?: string
  ): Promise<ActiveUnit> {
    const activeUnit = await this.getActiveUnitById(unitId);
    if (!activeUnit) {
      throw new Error('Активный юнит не найден');
    }

    return this.updateActiveUnit(unitId, { status, callId });
  }

  async goOnDuty(characterId: string, unitId: string, location?: string): Promise<ActiveUnit> {
    // Проверяем, нет ли уже активного юнита у персонажа
    const existingUnits = await this.getActiveUnitsByCharacter(characterId);
    if (existingUnits.length > 0) {
      throw new Error('Персонаж уже на дежурстве');
    }

    return this.createActiveUnit({
      characterId,
      unitId,
      status: UnitStatus.AVAILABLE,
      location,
      isActive: true
    });
  }

  async goOffDuty(characterId: string): Promise<void> {
    const activeUnits = await this.getActiveUnitsByCharacter(characterId);
    
    if (activeUnits.length === 0) {
      throw new Error('Персонаж не на дежурстве');
    }

    // Завершаем все активные юниты персонажа
    await Promise.all(
      activeUnits.map(unit =>
        this.deleteActiveUnit(unit.id)
      )
    );
  }

  // ===========================================
  // ВЛОЖЕНИЯ К ВЫЗОВАМ
  // ===========================================

  async addCallAttachment(data: InsertCallAttachment): Promise<CallAttachment> {
    return this.storage.insert('call_attachments', data);
  }

  async getCallAttachments(callId: string): Promise<CallAttachment[]> {
    return this.storage.list('call_attachments', { callId });
  }

  async deleteCallAttachment(id: string): Promise<void> {
    await this.storage.delete('call_attachments', id);
  }

  // ===========================================
  // ПОИСК И ФИЛЬТРАЦИЯ
  // ===========================================

  async searchCalls(query: string): Promise<Call911[]> {
    return this.storage.search('call911', query, ['callerName', 'location', 'description']);
  }

  async getCallsByDateRange(startDate: string, endDate: string): Promise<Call911[]> {
    return this.storage.list('call911', {
      createdAt: { gte: startDate, lte: endDate }
    });
  }

  async getCallsByLocation(location: string): Promise<Call911[]> {
    return this.storage.list('call911', { location });
  }

  async getCallsByCaller(phoneNumber: string): Promise<Call911[]> {
    return this.storage.list('call911', { callerPhone: phoneNumber });
  }

  // ===========================================
  // СТАТИСТИКА
  // ===========================================

  async getCallStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    byPriority: Record<Call911['priority'], number>;
    byStatus: Record<Call911['status'], number>;
  }> {
    const [total, active, completed, cancelled] = await Promise.all([
      this.storage.count('call911'),
      this.storage.count('call911', { 
        status: { in: ['pending', 'dispatched', 'en_route', 'on_scene'] }
      }),
      this.storage.count('call911', { status: 'completed' }),
      this.storage.count('call911', { status: 'cancelled' })
    ]);

    const [low, medium, high, emergency] = await Promise.all([
      this.storage.count('call911', { priority: 'low' }),
      this.storage.count('call911', { priority: 'medium' }),
      this.storage.count('call911', { priority: 'high' }),
      this.storage.count('call911', { priority: 'emergency' })
    ]);

    const [pending, dispatched, enRoute, onScene, completedCount, cancelledCount] = await Promise.all([
      this.storage.count('call911', { status: 'pending' }),
      this.storage.count('call911', { status: 'dispatched' }),
      this.storage.count('call911', { status: 'en_route' }),
      this.storage.count('call911', { status: 'on_scene' }),
      this.storage.count('call911', { status: 'completed' }),
      this.storage.count('call911', { status: 'cancelled' })
    ]);

    return {
      total,
      active,
      completed: completedCount,
      cancelled: cancelledCount,
      byPriority: {
        low,
        medium,
        high,
        emergency
      },
      byStatus: {
        pending,
        dispatched,
        en_route: enRoute,
        on_scene: onScene,
        completed: completedCount,
        cancelled: cancelledCount
      }
    };
  }

  async getCallActivity(days: number = 30): Promise<{
    total: number;
    byPriority: Record<Call911['priority'], number>;
    byStatus: Record<Call911['status'], number>;
    averageResponseTime: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const calls = await this.getCallsByDateRange(startDate.toISOString(), new Date().toISOString());

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      emergency: 0
    };

    const byStatus = {
      pending: 0,
      dispatched: 0,
      en_route: 0,
      on_scene: 0,
      completed: 0,
      cancelled: 0
    };

    let totalResponseTime = 0;
    let completedCalls = 0;

    calls.forEach(call => {
      byPriority[call.priority]++;
      byStatus[call.status]++;

      if (call.status === 'completed') {
        completedCalls++;
        // Здесь можно добавить логику расчета времени ответа
        // если есть поля времени создания и завершения
      }
    });

    const averageResponseTime = completedCalls > 0 ? totalResponseTime / completedCalls : 0;

    return {
      total: calls.length,
      byPriority,
      byStatus,
      averageResponseTime
    };
  }

  async getUnitActivity(unitId: string, days: number = 30): Promise<{
    totalCalls: number;
    completedCalls: number;
    averageResponseTime: number;
    currentStatus: UnitStatus | null;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const calls = await this.storage.list('call911', {
      assignedUnits: { contains: unitId },
      createdAt: { gte: startDate.toISOString() }
    });

    const completedCalls = calls.filter(call => call.status === 'completed');
    const activeUnit = await this.getActiveUnitById(unitId);

    return {
      totalCalls: calls.length,
      completedCalls: completedCalls.length,
      averageResponseTime: 0, // Можно добавить расчет
      currentStatus: activeUnit?.status || null
    };
  }

  // ===========================================
  // ЭКСТРЕННЫЕ ОПЕРАЦИИ
  // ===========================================

  async sendPanicAlert(unitId: string, location?: string): Promise<void> {
    const activeUnit = await this.getActiveUnitById(unitId);
    if (!activeUnit) {
      throw new Error('Активный юнит не найден');
    }

    await this.updateUnitStatus(unitId, UnitStatus.PANIC);

    // Здесь можно добавить логику отправки уведомлений
    // всем доступным юнитам в радиусе
  }

  async getNearbyUnits(location: string, radius: number = 5): Promise<ActiveUnit[]> {
    // Здесь должна быть логика поиска ближайших юнитов
    // Пока возвращаем все доступные юниты
    return this.storage.list('active_units', { 
      isActive: true,
      status: UnitStatus.AVAILABLE
    });
  }

  async getAvailableUnits(): Promise<ActiveUnit[]> {
    return this.storage.list('active_units', {
      isActive: true,
      status: UnitStatus.AVAILABLE
    });
  }
}

// Экспортируем единственный экземпляр
export const call911Service = new Call911Service(new SupabaseStorage()); 