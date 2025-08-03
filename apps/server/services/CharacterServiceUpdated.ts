import { pool } from '../db/index';

// ===== ЛОКАЛЬНЫЕ ТИПЫ ДЛЯ СОВМЕСТИМОСТИ =====
// Эти типы соответствуют ультимативному типу Character из mdtclient

export interface Character {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  ethnicity?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  address?: string;
  phoneNumber?: string;
  postal?: string;
  occupation?: string;
  mugshotUrl?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
  dead?: boolean;
  missing?: boolean;
  arrested?: boolean;
  isUnit?: boolean;
  badgeNumber?: string;
  callsign?: string;
  callsign2?: string;
  departmentId?: number;
  divisionId?: number;
  rankId?: number;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacterRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  ethnicity?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  address?: string;
  phoneNumber?: string;
  postal?: string;
  occupation?: string;
  mugshotUrl?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
  dead?: boolean;
  missing?: boolean;
  arrested?: boolean;
  isUnit?: boolean;
  badgeNumber?: string;
  callsign?: string;
  callsign2?: string;
  departmentId?: number;
  divisionId?: number;
  rankId?: number;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

export interface UpdateCharacterRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  ethnicity?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  address?: string;
  phoneNumber?: string;
  postal?: string;
  occupation?: string;
  mugshotUrl?: string;
  licenses?: any;
  medicalInfo?: any;
  flags?: string[];
  addressFlags?: string[];
  dead?: boolean;
  missing?: boolean;
  arrested?: boolean;
  isUnit?: boolean;
  badgeNumber?: string;
  callsign?: string;
  callsign2?: string;
  departmentId?: number;
  divisionId?: number;
  rankId?: number;
  hireDate?: string;
  terminationDate?: string;
  isActive?: boolean;
  suspended?: boolean;
  whitelistStatus?: string;
  radioChannelId?: string;
}

// ===== ОБНОВЛЕННЫЙ CHARACTER SERVICE - СИНХРОНИЗИРОВАН С УЛЬТИМАТИВНЫМ ТИПОМ =====

export class CharacterServiceUpdated {
  private pool: any;

  constructor() {
    this.pool = pool;
  }

  // ===== АДАПТЕР ТИПОВ (ПРОСТОЕ ПРЕОБРАЗОВАНИЕ SNAKE_CASE -> CAMELCASE) =====
  
  private adaptDbToCharacter(dbRow: any): Character {
    return {
      // --- Основные поля ---
      id: dbRow.id.toString(),
      ownerId: dbRow.owner_id,
      
      // --- Базовые/Гражданские поля ---
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      dateOfBirth: dbRow.dob,
      gender: dbRow.gender,
      ethnicity: dbRow.ethnicity,
      height: dbRow.height,
      weight: dbRow.weight,
      hairColor: dbRow.hair_color,
      eyeColor: dbRow.eye_color,
      address: dbRow.address,
      phoneNumber: dbRow.phone_number,
      postal: dbRow.postal,
      occupation: dbRow.occupation,
      mugshotUrl: dbRow.mugshot_url,
      licenses: dbRow.licenses,
      medicalInfo: dbRow.medical_info,
      flags: dbRow.flags || [],
      addressFlags: dbRow.address_flags || [],
      dead: dbRow.dead || false,
      missing: dbRow.missing || false,
      arrested: dbRow.arrested || false,

      // --- Поля сотрудника LEO/EMS ---
      isUnit: dbRow.is_unit || false,
      badgeNumber: dbRow.badge_number,
      callsign: dbRow.callsign,
      callsign2: dbRow.callsign2,
      departmentId: dbRow.department_id,
      divisionId: dbRow.division_id,
      rankId: dbRow.rank_id,
      hireDate: dbRow.hire_date,
      terminationDate: dbRow.termination_date,
      isActive: dbRow.is_active !== false, // По умолчанию true
      suspended: dbRow.suspended || false,
      whitelistStatus: dbRow.whitelist_status,
      radioChannelId: dbRow.radio_channel_id,

      // --- Метаданные ---
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }

  private adaptCharacterToDb(character: CreateCharacterRequest): any {
    return {
      // --- Базовые/Гражданские поля ---
      first_name: character.firstName,
      last_name: character.lastName,
      dob: character.dateOfBirth,
      gender: character.gender,
      ethnicity: character.ethnicity,
      height: character.height,
      weight: character.weight,
      hair_color: character.hairColor,
      eye_color: character.eyeColor,
      address: character.address,
      phone_number: character.phoneNumber,
      postal: character.postal,
      occupation: character.occupation,
      mugshot_url: character.mugshotUrl,
      licenses: character.licenses,
      medical_info: character.medicalInfo,
      flags: character.flags || [],
      address_flags: character.addressFlags || [],
      dead: character.dead || false,
      missing: character.missing || false,
      arrested: character.arrested || false,

      // --- Поля сотрудника LEO/EMS ---
      is_unit: character.isUnit || false,
      badge_number: character.badgeNumber,
      callsign: character.callsign,
      callsign2: character.callsign2,
      department_id: character.departmentId,
      division_id: character.divisionId,
      rank_id: character.rankId,
      hire_date: character.hireDate,
      termination_date: character.terminationDate,
      is_active: character.isActive !== false,
      suspended: character.suspended || false,
      whitelist_status: character.whitelistStatus,
      radio_channel_id: character.radioChannelId
    };
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ =====
  
  async getCharacter(id: string): Promise<Character | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM public.get_character_by_id($1)
      `, [id]);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToCharacter(result.rows[0]);
    } catch (error) {
      console.error('Error getting character:', error);
      throw new Error('Failed to get character');
    }
  }

  async getCharactersByOwner(ownerId: string): Promise<Character[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM public.get_characters_with_filters($1, NULL, NULL, 100, 0)
      `, [ownerId]);

      return result.rows.map((char: any) => this.adaptDbToCharacter(char));
    } catch (error) {
      console.error('Error getting characters by owner:', error);
      throw new Error('Failed to get characters by owner');
    }
  }

  async createCharacter(ownerId: string, character: CreateCharacterRequest): Promise<Character> {
    try {
      const dbData = this.adaptCharacterToDb(character);
      
      const result = await this.pool.query(`
        INSERT INTO characters (
          owner_id,
          first_name, last_name, dob, gender, ethnicity, height, weight,
          hair_color, eye_color, address, phone_number, postal, occupation,
          mugshot_url, licenses, medical_info, flags, address_flags,
          dead, missing, arrested, is_unit, badge_number, callsign, callsign2,
          department_id, division_id, rank_id, hire_date, termination_date,
          is_active, suspended, whitelist_status, radio_channel_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, NOW(), NOW())
        RETURNING *
      `, [
        ownerId,
        dbData.first_name, dbData.last_name, dbData.dob, dbData.gender, dbData.ethnicity, dbData.height, dbData.weight,
        dbData.hair_color, dbData.eye_color, dbData.address, dbData.phone_number, dbData.postal, dbData.occupation,
        dbData.mugshot_url, dbData.licenses, dbData.medical_info, dbData.flags, dbData.address_flags,
        dbData.dead, dbData.missing, dbData.arrested, dbData.is_unit, dbData.badge_number, dbData.callsign, dbData.callsign2,
        dbData.department_id, dbData.division_id, dbData.rank_id, dbData.hire_date, dbData.termination_date,
        dbData.is_active, dbData.suspended, dbData.whitelist_status, dbData.radio_channel_id
      ]);

      return this.adaptDbToCharacter(result.rows[0]);
    } catch (error) {
      console.error('Error creating character:', error);
      throw new Error('Failed to create character');
    }
  }

  async updateCharacter(id: string, ownerId: string, updates: UpdateCharacterRequest): Promise<Character | undefined> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Динамически строим запрос обновления
      if (updates.firstName !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        updateValues.push(updates.firstName);
      }
      if (updates.lastName !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        updateValues.push(updates.lastName);
      }
      if (updates.dateOfBirth !== undefined) {
        updateFields.push(`dob = $${paramIndex++}`);
        updateValues.push(updates.dateOfBirth);
      }
      if (updates.gender !== undefined) {
        updateFields.push(`gender = $${paramIndex++}`);
        updateValues.push(updates.gender);
      }
      if (updates.ethnicity !== undefined) {
        updateFields.push(`ethnicity = $${paramIndex++}`);
        updateValues.push(updates.ethnicity);
      }
      if (updates.height !== undefined) {
        updateFields.push(`height = $${paramIndex++}`);
        updateValues.push(updates.height);
      }
      if (updates.weight !== undefined) {
        updateFields.push(`weight = $${paramIndex++}`);
        updateValues.push(updates.weight);
      }
      if (updates.hairColor !== undefined) {
        updateFields.push(`hair_color = $${paramIndex++}`);
        updateValues.push(updates.hairColor);
      }
      if (updates.eyeColor !== undefined) {
        updateFields.push(`eye_color = $${paramIndex++}`);
        updateValues.push(updates.eyeColor);
      }
      if (updates.address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`);
        updateValues.push(updates.address);
      }
      if (updates.phoneNumber !== undefined) {
        updateFields.push(`phone_number = $${paramIndex++}`);
        updateValues.push(updates.phoneNumber);
      }
      if (updates.postal !== undefined) {
        updateFields.push(`postal = $${paramIndex++}`);
        updateValues.push(updates.postal);
      }
      if (updates.occupation !== undefined) {
        updateFields.push(`occupation = $${paramIndex++}`);
        updateValues.push(updates.occupation);
      }
      if (updates.mugshotUrl !== undefined) {
        updateFields.push(`mugshot_url = $${paramIndex++}`);
        updateValues.push(updates.mugshotUrl);
      }
      if (updates.licenses !== undefined) {
        updateFields.push(`licenses = $${paramIndex++}`);
        updateValues.push(updates.licenses);
      }
      if (updates.medicalInfo !== undefined) {
        updateFields.push(`medical_info = $${paramIndex++}`);
        updateValues.push(updates.medicalInfo);
      }
      if (updates.flags !== undefined) {
        updateFields.push(`flags = $${paramIndex++}`);
        updateValues.push(updates.flags);
      }
      if (updates.addressFlags !== undefined) {
        updateFields.push(`address_flags = $${paramIndex++}`);
        updateValues.push(updates.addressFlags);
      }
      if (updates.dead !== undefined) {
        updateFields.push(`dead = $${paramIndex++}`);
        updateValues.push(updates.dead);
      }
      if (updates.missing !== undefined) {
        updateFields.push(`missing = $${paramIndex++}`);
        updateValues.push(updates.missing);
      }
      if (updates.arrested !== undefined) {
        updateFields.push(`arrested = $${paramIndex++}`);
        updateValues.push(updates.arrested);
      }
      if (updates.isUnit !== undefined) {
        updateFields.push(`is_unit = $${paramIndex++}`);
        updateValues.push(updates.isUnit);
      }
      if (updates.badgeNumber !== undefined) {
        updateFields.push(`badge_number = $${paramIndex++}`);
        updateValues.push(updates.badgeNumber);
      }
      if (updates.callsign !== undefined) {
        updateFields.push(`callsign = $${paramIndex++}`);
        updateValues.push(updates.callsign);
      }
      if (updates.callsign2 !== undefined) {
        updateFields.push(`callsign2 = $${paramIndex++}`);
        updateValues.push(updates.callsign2);
      }
      if (updates.departmentId !== undefined) {
        updateFields.push(`department_id = $${paramIndex++}`);
        updateValues.push(updates.departmentId);
      }
      if (updates.divisionId !== undefined) {
        updateFields.push(`division_id = $${paramIndex++}`);
        updateValues.push(updates.divisionId);
      }
      if (updates.rankId !== undefined) {
        updateFields.push(`rank_id = $${paramIndex++}`);
        updateValues.push(updates.rankId);
      }
      if (updates.hireDate !== undefined) {
        updateFields.push(`hire_date = $${paramIndex++}`);
        updateValues.push(updates.hireDate);
      }
      if (updates.terminationDate !== undefined) {
        updateFields.push(`termination_date = $${paramIndex++}`);
        updateValues.push(updates.terminationDate);
      }
      if (updates.isActive !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        updateValues.push(updates.isActive);
      }
      if (updates.suspended !== undefined) {
        updateFields.push(`suspended = $${paramIndex++}`);
        updateValues.push(updates.suspended);
      }
      if (updates.whitelistStatus !== undefined) {
        updateFields.push(`whitelist_status = $${paramIndex++}`);
        updateValues.push(updates.whitelistStatus);
      }
      if (updates.radioChannelId !== undefined) {
        updateFields.push(`radio_channel_id = $${paramIndex++}`);
        updateValues.push(updates.radioChannelId);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(id, ownerId);

      const result = await this.pool.query(`
        UPDATE characters 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex++} AND owner_id = $${paramIndex++}
        RETURNING *
      `, updateValues);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToCharacter(result.rows[0]);
    } catch (error) {
      console.error('Error updating character:', error);
      throw new Error('Failed to update character');
    }
  }

  async deleteCharacter(id: string, ownerId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        DELETE FROM characters 
        WHERE id = $1 AND owner_id = $2
      `, [id, ownerId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting character:', error);
      throw new Error('Failed to delete character');
    }
  }

  async getAllCharacters(): Promise<Character[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM public.get_all_characters()
      `);

      return result.rows.map((char: any) => this.adaptDbToCharacter(char));
    } catch (error) {
      console.error('Error getting all characters:', error);
      throw new Error('Failed to get all characters');
    }
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====
  
  async searchCharacters(query: string, limit: number = 10): Promise<Character[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM characters 
        WHERE 
          first_name ILIKE $1 OR 
          last_name ILIKE $1 OR 
          phone_number ILIKE $1 OR
          badge_number ILIKE $1
        ORDER BY 
          CASE 
            WHEN first_name ILIKE $1 THEN 1
            WHEN last_name ILIKE $1 THEN 2
            ELSE 3
          END,
          created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);

      return result.rows.map((char: any) => this.adaptDbToCharacter(char));
    } catch (error) {
      console.error('Error searching characters:', error);
      throw new Error('Failed to search characters');
    }
  }

  async getCharactersWithFilters(filters: {
    ownerId?: string;
    gender?: string;
    occupation?: string;
    departmentId?: number;
    isUnit?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Character[]> {
    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (filters.ownerId) {
        whereConditions.push(`owner_id = $${paramIndex++}`);
        queryParams.push(filters.ownerId);
      }

      if (filters.gender) {
        whereConditions.push(`gender = $${paramIndex++}`);
        queryParams.push(filters.gender);
      }

      if (filters.occupation) {
        whereConditions.push(`occupation ILIKE $${paramIndex++}`);
        queryParams.push(`%${filters.occupation}%`);
      }

      if (filters.departmentId) {
        whereConditions.push(`department_id = $${paramIndex++}`);
        queryParams.push(filters.departmentId);
      }

      if (filters.isUnit !== undefined) {
        whereConditions.push(`is_unit = $${paramIndex++}`);
        queryParams.push(filters.isUnit);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
      const offsetClause = filters.offset ? `OFFSET $${paramIndex++}` : '';

      if (filters.limit) queryParams.push(filters.limit);
      if (filters.offset) queryParams.push(filters.offset);

      const result = await this.pool.query(`
        SELECT * FROM characters 
        ${whereClause}
        ORDER BY created_at DESC
        ${limitClause}
        ${offsetClause}
      `, queryParams);

      return result.rows.map((char: any) => this.adaptDbToCharacter(char));
    } catch (error) {
      console.error('Error getting characters with filters:', error);
      throw new Error('Failed to get characters with filters');
    }
  }

  // ===== ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ =====

  async getCharacterCount(): Promise<number> {
    try {
      const result = await this.pool.query('SELECT public.get_character_count()');
      return parseInt(result.rows[0].get_character_count);
    } catch (error) {
      console.error('Error getting character count:', error);
      throw new Error('Failed to get character count');
    }
  }

  async getCharacterCountByOwner(ownerId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        'SELECT public.get_character_count_by_owner($1)',
        [ownerId]
      );
      return parseInt(result.rows[0].get_character_count_by_owner);
    } catch (error) {
      console.error('Error getting character count by owner:', error);
      throw new Error('Failed to get character count by owner');
    }
  }

  async getCharacterFullName(id: string): Promise<string | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT first_name, last_name FROM public.get_character_by_id($1)',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }

      const char = result.rows[0];
      return `${char.first_name} ${char.last_name}`;
    } catch (error) {
      console.error('Error getting character full name:', error);
      throw new Error('Failed to get character full name');
    }
  }

  async getCharacterAge(id: string): Promise<number | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT dob FROM public.get_character_by_id($1)',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }

      const dateOfBirth = new Date(result.rows[0].dob);
      const today = new Date();
      let age = today.getFullYear() - dateOfBirth.getFullYear();
      const monthDiff = today.getMonth() - dateOfBirth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      console.error('Error getting character age:', error);
      throw new Error('Failed to get character age');
    }
  }

  async isCharacterAdult(id: string): Promise<boolean> {
    const age = await this.getCharacterAge(id);
    return age !== undefined && age >= 18;
  }

  async validateCharacterData(character: CreateCharacterRequest): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Проверяем обязательные поля
    if (!character.firstName || character.firstName.trim() === '') {
      errors.push('firstName is required');
    }

    if (!character.lastName || character.lastName.trim() === '') {
      errors.push('lastName is required');
    }

    if (!character.dateOfBirth) {
      errors.push('dateOfBirth is required');
    } else {
      const dateOfBirth = new Date(character.dateOfBirth);
      const today = new Date();
      if (dateOfBirth > today) {
        errors.push('dateOfBirth cannot be in the future');
      }
    }

    if (character.gender && !['Male', 'Female', 'male', 'female'].includes(character.gender)) {
      errors.push('gender must be Male, Female, male, or female');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ===== МЕТОДЫ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ =====

  async getCharacterLegacyFormat(id: string): Promise<any | undefined> {
    try {
      const character = await this.getCharacter(id);
      if (!character) return undefined;

      // Возвращаем в старом формате для обратной совместимости
      return {
        id: character.id,
        firstName: character.firstName,
        lastName: character.lastName,
        dateOfBirth: character.dateOfBirth,
        gender: character.gender,
        address: character.address,
        phoneNumber: character.phoneNumber,
        occupation: character.occupation,
        photoUrl: character.mugshotUrl,
        ssn: character.licenses?.ssn,
        flags: character.flags,
        addressFlags: character.addressFlags
      };
    } catch (error) {
      console.error('Error getting character in legacy format:', error);
      throw new Error('Failed to get character in legacy format');
    }
  }
}

// Экспортируем экземпляр сервиса
export const characterServiceUpdated = new CharacterServiceUpdated(); 