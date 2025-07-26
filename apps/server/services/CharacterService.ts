import { pool } from '../db/index.js';
import type { 
  Character,
  InsertCharacter 
} from '../types';

export class CharacterService {
  
  /**
   * Создать нового персонажа
   */
  public async createCharacter(ownerId: number, data: any): Promise<Character> {
    const characterData = {
      owner_id: ownerId,
      first_name: data.firstName,
      last_name: data.lastName,
      department_id: data.departmentId || 1,
      rank: data.rank,
      status: data.status || 'active',
      insurance_number: data.insuranceNumber,
      address: data.address
    };

    const result = await pool.query(`
      INSERT INTO characters (
        owner_id, first_name, last_name, department_id, rank, status, insurance_number, address,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      ) RETURNING *
    `, [
      characterData.owner_id, characterData.first_name, characterData.last_name,
      characterData.department_id, characterData.rank, characterData.status,
      characterData.insurance_number, characterData.address
    ]);

    if (!result.rows[0]) {
      throw new Error('Failed to create character');
    }

    return this.mapDbRowToCharacter(result.rows[0]);
  }

  /**
   * Получить персонажа по ID
   */
  public async getCharacterById(id: number, ownerId?: number): Promise<Character | null> {
    const whereClause = ownerId 
      ? 'WHERE id = $1 AND owner_id = $2'
      : 'WHERE id = $1';
    
    const params = ownerId ? [id, ownerId] : [id];

    const result = await pool.query(`
      SELECT * FROM characters ${whereClause}
    `, params);

    return result.rows[0] ? this.mapDbRowToCharacter(result.rows[0]) : null;
  }

  /**
   * Получить всех персонажей пользователя
   */
  public async getCharactersByOwner(ownerId: number): Promise<Character[]> {
    const result = await pool.query(`
      SELECT * FROM characters 
      WHERE owner_id = $1 
      ORDER BY created_at DESC
    `, [ownerId]);

    return result.rows.map(row => this.mapDbRowToCharacter(row));
  }

  /**
   * Обновить персонажа
   */
  public async updateCharacter(id: number, ownerId: number, data: any): Promise<Character> {
    // Подготавливаем данные для обновления
    const updateData: Partial<InsertCharacter> = {};
    
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId;
    if (data.rank !== undefined) updateData.rank = data.rank;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.insuranceNumber !== undefined) updateData.insuranceNumber = data.insuranceNumber;
    if (data.address !== undefined) updateData.address = data.address;

    const result = await pool.query(`
      UPDATE characters SET
        first_name = $1, last_name = $2, department_id = $3, rank = $4, status = $5,
        insurance_number = $6, address = $7, updated_at = NOW()
      WHERE id = $8 AND owner_id = $9
      RETURNING *
    `, [
      updateData.firstName, updateData.lastName, updateData.departmentId, updateData.rank,
      updateData.status, updateData.insuranceNumber, updateData.address, id, ownerId
    ]);

    if (!result.rows[0]) {
      throw new Error('Character not found or access denied');
    }

    return this.mapDbRowToCharacter(result.rows[0]);
  }

  /**
   * Удалить персонажа
   */
  public async deleteCharacter(id: number, ownerId: number): Promise<boolean> {
    const result = await pool.query(`
      DELETE FROM characters WHERE id = $1 AND owner_id = $2
    `, [id, ownerId]);

    return (result.rowCount || 0) > 0;
  }

  /**
   * Поиск персонажей по различным критериям
   */
  public async searchCharacters(query: string, ownerId?: number): Promise<Character[]> {
    const whereClause = ownerId 
      ? 'WHERE owner_id = $1 AND (first_name ILIKE $2 OR last_name ILIKE $3 OR insurance_number ILIKE $4)'
      : 'WHERE first_name ILIKE $1 OR last_name ILIKE $2 OR insurance_number ILIKE $3';
    
    const params = ownerId ? [ownerId, `%${query}%`, `%${query}%`, `%${query}%`] : [`%${query}%`, `%${query}%`, `%${query}%`];

    const result = await pool.query(`
      SELECT * FROM characters ${whereClause}
      ORDER BY first_name ASC, last_name ASC
    `, params);

    return result.rows.map(row => this.mapDbRowToCharacter(row));
  }

  /**
   * Получить персонажей по типу (civilian, leo, fire, ems)
   */
  public async getCharactersByType(type: string, ownerId?: number): Promise<Character[]> {
    const whereClause = ownerId 
      ? 'WHERE owner_id = $1 AND type = $2'
      : 'WHERE type = $1';
    
    const params = ownerId ? [ownerId, type] : [type];

    const result = await pool.query(`
      SELECT * FROM characters ${whereClause}
      ORDER BY created_at DESC
    `, params);

    return result.rows.map(row => this.mapDbRowToCharacter(row));
  }

  /**
   * Получить статистику персонажей пользователя
   */
  public async getCharacterStats(ownerId: number): Promise<{
    total: number;
    byType: Record<string, number>;
    active: number;
    dead: number;
    missing: number;
    arrested: number;
  }> {
    const userCharacters = await this.getCharactersByOwner(ownerId);
    
    const stats = {
      total: userCharacters.length,
      byType: {} as Record<string, number>,
      active: 0,
      dead: 0,
      missing: 0,
      arrested: 0,
    };

    userCharacters.forEach(character => {
      // Подсчет по статусам (используем только доступные поля)
      if (character.status === 'dead') stats.dead++;
      else if (character.status === 'missing') stats.missing++;
      else if (character.status === 'arrested') stats.arrested++;
      else stats.active++;
    });

    return stats;
  }

  /**
   * Преобразовать строку БД в объект Character
   */
  private mapDbRowToCharacter(row: any): Character {
    return {
      id: row.id,
      ownerId: row.owner_id,
      firstName: row.first_name,
      lastName: row.last_name,
      departmentId: row.department_id || 1, // Значение по умолчанию
      rank: row.rank || undefined,
      status: row.status || 'active',
      insuranceNumber: row.insurance_number || undefined,
      address: row.address || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// Экспортируем экземпляр сервиса
export const characterService = new CharacterService(); 