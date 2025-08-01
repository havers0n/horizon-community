import { pool } from '../db/index';
import type { 
  MDTUnit, 
  MDTCall911, 
  Signal, 
  SignalNotification,
  CreateUnitData,
  CreateCallData,
  CreateSignalData,
  UpdateUnitData,
  UpdateCallData,
  UpdateSignalData,
  Location
} from '@roleplay-identity/shared-schema';

export class MDTService {
  private pool: any;

  constructor() {
    this.pool = pool;
  }

  // ===== УПРАВЛЕНИЕ ЮНИТАМИ =====

  /**
   * Получить все активные юниты
   */
  async getActiveUnits(): Promise<MDTUnit[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          mu.id,
          mu.unit_number,
          mu.department_id,
          mu.status,
          mu.location,
          mu.current_call_id,
          mu.partner_id,
          mu.vehicle_id,
          mu.is_panic,
          mu.last_update,
          mu.created_at,
          c.first_name,
          c.last_name,
          c.badge_number,
          c.callsign,
          d.name as department_name,
          v.plate as vehicle_plate,
          v.model as vehicle_model
        FROM mdt.mdt_units mu
        LEFT JOIN common.characters c ON mu.character_id = c.id
        LEFT JOIN common.departments d ON mu.department_id = d.id
        LEFT JOIN common.vehicles v ON mu.vehicle_id = v.id
        WHERE mu.status != 'offline'
        ORDER BY mu.last_update DESC
      `);

      return result.rows.map(this.mapUnitFromDb);
    } catch (error) {
      console.error('Error getting active units:', error);
      throw new Error('Failed to get active units');
    }
  }

  /**
   * Создать новый юнит
   */
  async createUnit(data: CreateUnitData): Promise<MDTUnit> {
    try {
      const result = await this.pool.query(`
        INSERT INTO mdt.mdt_units (
          character_id, unit_number, department_id, status, 
          location, vehicle_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `, [
        data.characterId,
        data.unitNumber,
        data.departmentId,
        data.status || 'available',
        JSON.stringify(data.location || null),
        data.vehicleId || null
      ]);

      return this.mapUnitFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error creating unit:', error);
      throw new Error('Failed to create unit');
    }
  }

  /**
   * Обновить статус юнита
   */
  async updateUnitStatus(unitId: number, status: string): Promise<MDTUnit> {
    try {
      const result = await this.pool.query(`
        UPDATE mdt.mdt_units 
        SET status = $1, last_update = NOW()
        WHERE id = $2
        RETURNING *
      `, [status, unitId]);

      if (result.rows.length === 0) {
        throw new Error('Unit not found');
      }

      return this.mapUnitFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error updating unit status:', error);
      throw new Error('Failed to update unit status');
    }
  }

  /**
   * Обновить местоположение юнита
   */
  async updateUnitLocation(unitId: number, location: Location): Promise<MDTUnit> {
    try {
      const result = await this.pool.query(`
        UPDATE mdt.mdt_units 
        SET location = $1, last_update = NOW()
        WHERE id = $2
        RETURNING *
      `, [JSON.stringify(location), unitId]);

      if (result.rows.length === 0) {
        throw new Error('Unit not found');
      }

      return this.mapUnitFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error updating unit location:', error);
      throw new Error('Failed to update unit location');
    }
  }

  /**
   * Активировать панику для юнита
   */
  async activatePanic(unitId: number): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE mdt.mdt_units 
        SET is_panic = TRUE, last_update = NOW()
        WHERE id = $1
      `, [unitId]);

      // Отправляем уведомления всем диспетчерам
      await this.notifyPanic(unitId);
    } catch (error) {
      console.error('Error activating panic:', error);
      throw new Error('Failed to activate panic');
    }
  }

  /**
   * Деактивировать панику для юнита
   */
  async deactivatePanic(unitId: number): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE mdt.mdt_units 
        SET is_panic = FALSE, last_update = NOW()
        WHERE id = $1
      `, [unitId]);
    } catch (error) {
      console.error('Error deactivating panic:', error);
      throw new Error('Failed to deactivating panic');
    }
  }

  // ===== УПРАВЛЕНИЕ ВЫЗОВАМИ 911 =====

  /**
   * Получить все вызовы 911
   */
  async getCalls(): Promise<MDTCall911[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          mc.id,
          mc.caller_name,
          mc.caller_phone,
          mc.location,
          mc.description,
          mc.type,
          mc.priority,
          mc.status,
          mc.assigned_units,
          mc.patient_info,
          mc.fire_info,
          mc.created_at,
          mc.updated_at
        FROM mdt.mdt_calls_911 mc
        ORDER BY mc.created_at DESC
      `);

      return result.rows.map(this.mapCallFromDb);
    } catch (error) {
      console.error('Error getting calls:', error);
      throw new Error('Failed to get calls');
    }
  }

  /**
   * Создать новый вызов 911
   */
  async createCall(data: CreateCallData): Promise<MDTCall911> {
    try {
      const result = await this.pool.query(`
        INSERT INTO mdt.mdt_calls_911 (
          caller_name, caller_phone, location, description,
          type, priority, status, patient_info, fire_info,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `, [
        data.callerName || null,
        data.callerPhone || null,
        data.location,
        data.description,
        data.type,
        data.priority || 1,
        data.status || 'pending',
        JSON.stringify(data.patientInfo || null),
        JSON.stringify(data.fireInfo || null)
      ]);

      return this.mapCallFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error creating call:', error);
      throw new Error('Failed to create call');
    }
  }

  /**
   * Обновить вызов 911
   */
  async updateCall(callId: number, data: UpdateCallData): Promise<MDTCall911> {
    try {
      const result = await this.pool.query(`
        UPDATE mdt.mdt_calls_911 
        SET 
          caller_name = COALESCE($1, caller_name),
          caller_phone = COALESCE($2, caller_phone),
          location = COALESCE($3, location),
          description = COALESCE($4, description),
          type = COALESCE($5, type),
          priority = COALESCE($6, priority),
          status = COALESCE($7, status),
          patient_info = COALESCE($8, patient_info),
          fire_info = COALESCE($9, fire_info),
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `, [
        data.callerName,
        data.callerPhone,
        data.location,
        data.description,
        data.type,
        data.priority,
        data.status,
        JSON.stringify(data.patientInfo),
        JSON.stringify(data.fireInfo),
        callId
      ]);

      if (result.rows.length === 0) {
        throw new Error('Call not found');
      }

      return this.mapCallFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error updating call:', error);
      throw new Error('Failed to update call');
    }
  }

  /**
   * Назначить юниты на вызов
   */
  async assignUnitsToCall(callId: number, unitIds: number[]): Promise<void> {
    try {
      // Обновляем вызов
      await this.pool.query(`
        UPDATE mdt.mdt_calls_911 
        SET assigned_units = $1, updated_at = NOW()
        WHERE id = $2
      `, [unitIds, callId]);

      // Обновляем статус юнитов
      await this.pool.query(`
        UPDATE mdt.mdt_units 
        SET current_call_id = $1, status = 'en_route', last_update = NOW()
        WHERE id = ANY($2)
      `, [callId, unitIds]);

      // Создаем записи о привязке
      for (const unitId of unitIds) {
        await this.pool.query(`
          INSERT INTO mdt.mdt_call_attachments (call_id, unit_id, status, created_at)
          VALUES ($1, $2, 'en_route', NOW())
        `, [callId, unitId]);
      }
    } catch (error) {
      console.error('Error assigning units to call:', error);
      throw new Error('Failed to assign units to call');
    }
  }

  /**
   * Обновить статус вызова
   */
  async updateCallStatus(callId: number, status: string): Promise<MDTCall911> {
    try {
      const result = await this.pool.query(`
        UPDATE mdt.mdt_calls_911 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [status, callId]);

      if (result.rows.length === 0) {
        throw new Error('Call not found');
      }

      return this.mapCallFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error updating call status:', error);
      throw new Error('Failed to update call status');
    }
  }

  // ===== УПРАВЛЕНИЕ СИГНАЛАМИ =====

  /**
   * Получить активные сигналы
   */
  async getActiveSignals(): Promise<Signal[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          ms.id,
          ms.title,
          ms.description,
          ms.type,
          ms.author_id,
          ms.priority,
          ms.location,
          ms.coordinates,
          ms.is_active,
          ms.expires_at,
          ms.created_at,
          u.username as author_name
        FROM mdt_signals ms
        LEFT JOIN public.users u ON ms.author_id = u.id
        WHERE ms.is_active = TRUE
        ORDER BY ms.created_at DESC
      `);

      return result.rows.map(this.mapSignalFromDb);
    } catch (error) {
      console.error('Error getting active signals:', error);
      throw new Error('Failed to get active signals');
    }
  }

  /**
   * Создать новый сигнал
   */
  async createSignal(data: CreateSignalData): Promise<Signal> {
    try {
      const result = await this.pool.query(`
        INSERT INTO mdt_signals (
          title, description, type, author_id, priority,
          location, coordinates, is_active, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `, [
        data.title,
        data.description,
        data.type,
        data.authorId,
        data.priority || 'medium',
        data.location || null,
        JSON.stringify(data.coordinates || null),
        data.isActive !== false,
        data.expiresAt || null
      ]);

      const signal = this.mapSignalFromDb(result.rows[0]);

      // Отправляем уведомления
      await this.notifySignal(Number(signal.id));

      return signal;
    } catch (error) {
      console.error('Error creating signal:', error);
      throw new Error('Failed to create signal');
    }
  }

  /**
   * Обновить сигнал
   */
  async updateSignal(signalId: number, data: UpdateSignalData): Promise<Signal> {
    try {
      const result = await this.pool.query(`
        UPDATE mdt_signals 
        SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          type = COALESCE($3, type),
          priority = COALESCE($4, priority),
          location = COALESCE($5, location),
          coordinates = COALESCE($6, coordinates),
          is_active = COALESCE($7, is_active),
          expires_at = COALESCE($8, expires_at)
        WHERE id = $9
        RETURNING *
      `, [
        data.title,
        data.description,
        data.type,
        data.priority,
        data.location,
        JSON.stringify(data.coordinates),
        data.isActive,
        data.expiresAt,
        signalId
      ]);

      if (result.rows.length === 0) {
        throw new Error('Signal not found');
      }

      return this.mapSignalFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error updating signal:', error);
      throw new Error('Failed to update signal');
    }
  }

  /**
   * Отозвать сигнал
   */
  async revokeSignal(signalId: number): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE mdt_signals 
        SET is_active = FALSE
        WHERE id = $1
      `, [signalId]);
    } catch (error) {
      console.error('Error revoking signal:', error);
      throw new Error('Failed to revoke signal');
    }
  }

  /**
   * Отправить уведомления о сигнале
   */
  async notifySignal(signalId: number): Promise<void> {
    try {
      // Получаем всех пользователей с соответствующими ролями
      const usersResult = await this.pool.query(`
        SELECT id FROM public.users 
        WHERE role IN ('admin', 'supervisor', 'member')
      `);

      // Создаем уведомления для каждого пользователя
      for (const user of usersResult.rows) {
        await this.pool.query(`
          INSERT INTO mdt_signal_notifications (signal_id, recipient_id, created_at)
          VALUES ($1, $2, NOW())
        `, [signalId, user.id]);
      }
    } catch (error) {
      console.error('Error notifying signal:', error);
      throw new Error('Failed to notify signal');
    }
  }

  /**
   * Отправить уведомления о панике
   */
  async notifyPanic(unitId: number): Promise<void> {
    try {
      // Получаем информацию о юните
      const unitResult = await this.pool.query(`
        SELECT mu.unit_number, c.first_name, c.last_name, d.name as department_name
        FROM mdt.mdt_units mu
        LEFT JOIN common.characters c ON mu.character_id = c.id
        LEFT JOIN common.departments d ON mu.department_id = d.id
        WHERE mu.id = $1
      `, [unitId]);

      if (unitResult.rows.length === 0) {
        throw new Error('Unit not found');
      }

      const unit = unitResult.rows[0];

      // Создаем сигнал о панике
      await this.createSignal({
        title: `ПАНИКА: ${unit.unit_number}`,
        description: `Офицер ${unit.first_name} ${unit.last_name} (${unit.department_name}) активировал панику`,
        type: 'LEO',
        authorId: 1, // Система
        priority: 'critical',
        isActive: true
      });
    } catch (error) {
      console.error('Error notifying panic:', error);
      throw new Error('Failed to notify panic');
    }
  }

  // ===== УПРАВЛЕНИЕ BOLO =====

  /**
   * Получить все BOLO
   */
  async getBolos(): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          mb.id,
          mb.type,
          mb.description,
          mb.vehicle,
          mb.plate,
          mb.reason,
          mb.priority,
          mb.location,
          mb.additional_info,
          mb.status,
          mb.created_at,
          mb.timestamp,
          mb.issued_by,
          u.username as issued_by_name
        FROM mdt.bolos mb
        LEFT JOIN public.users u ON mb.issued_by::integer = u.id
        WHERE mb.status != 'deleted'
        ORDER BY mb.created_at DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting BOLOs:', error);
      throw new Error('Failed to get BOLOs');
    }
  }

  /**
   * Создать новый BOLO
   */
  async createBolo(data: any): Promise<any> {
    try {
      const result = await this.pool.query(`
        INSERT INTO mdt.bolos (
          type, description, vehicle, plate, reason, priority, 
          location, additional_info, issued_by, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        data.type,
        data.description,
        data.vehicle || null,
        data.plate || null,
        data.reason,
        data.priority,
        data.location || null,
        data.additionalInfo || null,
        String(data.issuedBy), // Convert to string to match text field
        data.timestamp || new Date()
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating BOLO:', error);
      throw new Error('Failed to create BOLO');
    }
  }

  /**
   * Обновить BOLO
   */
  async updateBolo(boloId: number, data: any): Promise<any> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Динамически строим запрос обновления
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = key === 'additionalInfo' ? 'additional_info' : key;
          updateFields.push(`${dbField} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateValues.push(boloId);
      const result = await this.pool.query(`
        UPDATE mdt.bolos 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `, updateValues);

      if (result.rows.length === 0) {
        throw new Error('BOLO not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating BOLO:', error);
      throw new Error('Failed to update BOLO');
    }
  }

  /**
   * Удалить BOLO (soft delete)
   */
  async deleteBolo(boloId: number): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE mdt.bolos 
        SET status = 'deleted', updated_at = NOW()
        WHERE id = $1
      `, [boloId]);
    } catch (error) {
      console.error('Error deleting BOLO:', error);
      throw new Error('Failed to delete BOLO');
    }
  }

  // ===== УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ =====

  /**
   * Получить уведомления пользователя
   */
  async getNotifications(userId: number): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          msn.id,
          msn.signal_id,
          msn.is_read,
          msn.created_at,
          ms.title,
          ms.description,
          ms.type,
          ms.priority,
          ms.location
        FROM mdt_signal_notifications msn
        LEFT JOIN mdt_signals ms ON msn.signal_id = ms.id
        WHERE msn.recipient_id = $1
        ORDER BY msn.created_at DESC
        LIMIT 50
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE mdt_signal_notifications 
        SET is_read = TRUE
        WHERE id = $1 AND recipient_id = $2
      `, [notificationId, userId]);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====

  /**
   * Маппинг юнита из базы данных
   */
  private mapUnitFromDb(row: any): MDTUnit {
    return {
      id: row.id.toString(),
      unitNumber: row.unit_number,
      departmentId: row.department_id,
      departmentName: row.department_name,
      status: row.status,
      location: row.location,
      currentCallId: row.current_call_id,
      partnerId: row.partner_id,
      vehicleId: row.vehicle_id,
      vehiclePlate: row.vehicle_plate,
      vehicleModel: row.vehicle_model,
      isPanic: row.is_panic,
      lastUpdate: row.last_update,
      createdAt: row.created_at,
      characterId: row.character_id,
      firstName: row.first_name,
      lastName: row.last_name,
      badgeNumber: row.badge_number,
      callsign: row.callsign
    };
  }

  /**
   * Маппинг вызова из базы данных
   */
  private mapCallFromDb(row: any): MDTCall911 {
    return {
      id: row.id.toString(),
      callerName: row.caller_name,
      callerPhone: row.caller_phone,
      location: row.location,
      description: row.description,
      type: row.type,
      priority: row.priority,
      status: row.status,
      assignedUnits: row.assigned_units || [],
      patientInfo: row.patient_info,
      fireInfo: row.fire_info,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Маппинг сигнала из базы данных
   */
  private mapSignalFromDb(row: any): Signal {
    return {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      type: row.type,
      priority: row.priority,
      location: row.location,
      coordinates: row.coordinates,
      isActive: row.is_active,
      expiresAt: row.expires_at,
      authorId: row.author_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// Экспортируем экземпляр сервиса
export const mdtService = new MDTService(); 