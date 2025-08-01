import { pool } from '../db/index';
import {
  Character,
  LeoProfile,
  EmsProfile,
  FireProfile,
  FullCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CreateLeoProfileRequest,
  UpdateLeoProfileRequest,
  CreateEmsProfileRequest,
  UpdateEmsProfileRequest,
  CreateFireProfileRequest,
  UpdateFireProfileRequest,
  CharacterFilters,
  LeoProfileFilters,
  EmsProfileFilters,
  FireProfileFilters,
  CharacterStats,
  LeoProfileStats,
  EmsProfileStats,
  FireProfileStats,
  ValidationResult,
  LegacyCharacter
} from '../types/normalized-character.types';

// =================================================================
// НОРМАЛИЗОВАННЫЙ CHARACTER SERVICE
// Работает с новой структурой БД: common.characters + профили
// =================================================================

export class NormalizedCharacterService {
  private pool: any;

  constructor() {
    this.pool = pool;
  }

  // ===== АДАПТЕРЫ ТИПОВ (SNAKE_CASE -> CAMELCASE) =====

  private adaptDbToCharacter(dbRow: any): Character {
    return {
      id: dbRow.id.toString(),
      ownerId: dbRow.owner_id,
      firstName: dbRow.name || dbRow.first_name,
      lastName: dbRow.surname || dbRow.last_name,
      dateOfBirth: dbRow.dateOfBirth || dbRow.dob,
      gender: dbRow.gender,
      address: dbRow.address,
      phoneNumber: dbRow.phoneNumber || dbRow.phone_number,
      occupation: dbRow.occupation,
      photoUrl: dbRow.photoUrl || dbRow.mugshot_url,
      ssn: dbRow.ssn || dbRow.insurance_number,
      licenses: dbRow.licenses,
      medicalInfo: dbRow.medical_info,
      flags: dbRow.flags || [],
      addressFlags: dbRow.addressFlags || dbRow.address_flags || [],
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }

  private adaptCharacterToDb(character: CreateCharacterRequest): any {
    return {
      name: character.firstName,
      surname: character.lastName,
      dateOfBirth: character.dateOfBirth,
      gender: character.gender,
      address: character.address,
      phoneNumber: character.phoneNumber,
      occupation: character.occupation,
      photoUrl: character.photoUrl,
      ssn: character.ssn,
      licenses: character.licenses,
      medical_info: character.medicalInfo,
      flags: character.flags || [],
      addressFlags: character.addressFlags || []
    };
  }

  private adaptDbToLeoProfile(dbRow: any): LeoProfile {
    return {
      id: dbRow.id.toString(),
      characterId: dbRow.character_id.toString(),
      badgeNumber: dbRow.badge_number,
      rankId: dbRow.rank_id,
      divisionId: dbRow.division_id,
      departmentId: dbRow.department_id,
      callsign: dbRow.callsign,
      callsign2: dbRow.callsign2,
      status: dbRow.status,
      hireDate: dbRow.hire_date,
      terminationDate: dbRow.termination_date,
      isActive: dbRow.is_active,
      suspended: dbRow.suspended,
      whitelistStatus: dbRow.whitelist_status,
      radioChannelId: dbRow.radio_channel_id,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }

  private adaptDbToEmsProfile(dbRow: any): EmsProfile {
    return {
      id: dbRow.id.toString(),
      characterId: dbRow.character_id.toString(),
      badgeNumber: dbRow.badge_number,
      rankId: dbRow.rank_id,
      divisionId: dbRow.division_id,
      departmentId: dbRow.department_id,
      callsign: dbRow.callsign,
      callsign2: dbRow.callsign2,
      status: dbRow.status,
      hireDate: dbRow.hire_date,
      terminationDate: dbRow.termination_date,
      isActive: dbRow.is_active,
      suspended: dbRow.suspended,
      whitelistStatus: dbRow.whitelist_status,
      radioChannelId: dbRow.radio_channel_id,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }

  private adaptDbToFireProfile(dbRow: any): FireProfile {
    return {
      id: dbRow.id.toString(),
      characterId: dbRow.character_id.toString(),
      badgeNumber: dbRow.badge_number,
      rankId: dbRow.rank_id,
      divisionId: dbRow.division_id,
      departmentId: dbRow.department_id,
      callsign: dbRow.callsign,
      callsign2: dbRow.callsign2,
      status: dbRow.status,
      hireDate: dbRow.hire_date,
      terminationDate: dbRow.termination_date,
      isActive: dbRow.is_active,
      suspended: dbRow.suspended,
      whitelistStatus: dbRow.whitelist_status,
      radioChannelId: dbRow.radio_channel_id,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ С ПЕРСОНАЖАМИ =====

  async getCharacter(id: string): Promise<Character | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM common.characters WHERE id = $1
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

  async getFullCharacter(id: string): Promise<FullCharacter | undefined> {
    try {
      // Получаем персонажа
      const character = await this.getCharacter(id);
      if (!character) {
        return undefined;
      }

      // Получаем профили
      const [leoProfile, emsProfile, fireProfile] = await Promise.all([
        this.getLeoProfileByCharacterId(id),
        this.getEmsProfileByCharacterId(id),
        this.getFireProfileByCharacterId(id)
      ]);

      return {
        ...character,
        leoProfile,
        emsProfile,
        fireProfile
      };
    } catch (error) {
      console.error('Error getting full character:', error);
      throw new Error('Failed to get full character');
    }
  }

  async getCharactersByOwner(ownerId: string): Promise<Character[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM common.characters 
        WHERE owner_id = $1
        ORDER BY created_at DESC
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
        INSERT INTO common.characters (
          owner_id, name, surname, dateOfBirth, gender, address, phoneNumber,
          occupation, photoUrl, ssn, licenses, medical_info, flags, addressFlags,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `, [
        ownerId,
        dbData.name, dbData.surname, dbData.dateOfBirth, dbData.gender, dbData.address, dbData.phoneNumber,
        dbData.occupation, dbData.photoUrl, dbData.ssn, dbData.licenses, dbData.medical_info, dbData.flags, dbData.addressFlags
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
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.firstName);
      }
      if (updates.lastName !== undefined) {
        updateFields.push(`surname = $${paramIndex++}`);
        updateValues.push(updates.lastName);
      }
      if (updates.dateOfBirth !== undefined) {
        updateFields.push(`dateOfBirth = $${paramIndex++}`);
        updateValues.push(updates.dateOfBirth);
      }
      if (updates.gender !== undefined) {
        updateFields.push(`gender = $${paramIndex++}`);
        updateValues.push(updates.gender);
      }
      if (updates.address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`);
        updateValues.push(updates.address);
      }
      if (updates.phoneNumber !== undefined) {
        updateFields.push(`phoneNumber = $${paramIndex++}`);
        updateValues.push(updates.phoneNumber);
      }
      if (updates.occupation !== undefined) {
        updateFields.push(`occupation = $${paramIndex++}`);
        updateValues.push(updates.occupation);
      }
      if (updates.photoUrl !== undefined) {
        updateFields.push(`photoUrl = $${paramIndex++}`);
        updateValues.push(updates.photoUrl);
      }
      if (updates.ssn !== undefined) {
        updateFields.push(`ssn = $${paramIndex++}`);
        updateValues.push(updates.ssn);
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
        updateFields.push(`addressFlags = $${paramIndex++}`);
        updateValues.push(updates.addressFlags);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(id, ownerId);

      const result = await this.pool.query(`
        UPDATE common.characters 
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
        DELETE FROM common.characters 
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
        SELECT * FROM common.characters 
        ORDER BY created_at DESC
      `);

      return result.rows.map((char: any) => this.adaptDbToCharacter(char));
    } catch (error) {
      console.error('Error getting all characters:', error);
      throw new Error('Failed to get all characters');
    }
  }

  // ===== ОПЕРАЦИИ С ПРОФИЛЯМИ LEO =====

  async getLeoProfileByCharacterId(characterId: string): Promise<LeoProfile | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM common.leo_profiles WHERE character_id = $1
      `, [characterId]);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToLeoProfile(result.rows[0]);
    } catch (error) {
      console.error('Error getting LEO profile:', error);
      throw new Error('Failed to get LEO profile');
    }
  }

  async createLeoProfile(profile: CreateLeoProfileRequest): Promise<LeoProfile> {
    try {
      const result = await this.pool.query(`
        INSERT INTO common.leo_profiles (
          character_id, badge_number, rank_id, division_id, department_id,
          callsign, callsign2, status, hire_date, termination_date,
          is_active, suspended, whitelist_status, radio_channel_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `, [
        profile.characterId, profile.badgeNumber, profile.rankId, profile.divisionId, profile.departmentId,
        profile.callsign, profile.callsign2, profile.status || 'active', profile.hireDate, profile.terminationDate,
        profile.isActive !== false, profile.suspended || false, profile.whitelistStatus, profile.radioChannelId
      ]);

      return this.adaptDbToLeoProfile(result.rows[0]);
    } catch (error) {
      console.error('Error creating LEO profile:', error);
      throw new Error('Failed to create LEO profile');
    }
  }

  async updateLeoProfile(characterId: string, updates: UpdateLeoProfileRequest): Promise<LeoProfile | undefined> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Динамически строим запрос обновления
      if (updates.badgeNumber !== undefined) {
        updateFields.push(`badge_number = $${paramIndex++}`);
        updateValues.push(updates.badgeNumber);
      }
      if (updates.rankId !== undefined) {
        updateFields.push(`rank_id = $${paramIndex++}`);
        updateValues.push(updates.rankId);
      }
      if (updates.divisionId !== undefined) {
        updateFields.push(`division_id = $${paramIndex++}`);
        updateValues.push(updates.divisionId);
      }
      if (updates.departmentId !== undefined) {
        updateFields.push(`department_id = $${paramIndex++}`);
        updateValues.push(updates.departmentId);
      }
      if (updates.callsign !== undefined) {
        updateFields.push(`callsign = $${paramIndex++}`);
        updateValues.push(updates.callsign);
      }
      if (updates.callsign2 !== undefined) {
        updateFields.push(`callsign2 = $${paramIndex++}`);
        updateValues.push(updates.callsign2);
      }
      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(updates.status);
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
      updateValues.push(characterId);

      const result = await this.pool.query(`
        UPDATE common.leo_profiles 
        SET ${updateFields.join(', ')}
        WHERE character_id = $${paramIndex++}
        RETURNING *
      `, updateValues);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToLeoProfile(result.rows[0]);
    } catch (error) {
      console.error('Error updating LEO profile:', error);
      throw new Error('Failed to update LEO profile');
    }
  }

  async deleteLeoProfile(characterId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        DELETE FROM common.leo_profiles WHERE character_id = $1
      `, [characterId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting LEO profile:', error);
      throw new Error('Failed to delete LEO profile');
    }
  }

  // ===== ОПЕРАЦИИ С ПРОФИЛЯМИ EMS =====

  async getEmsProfileByCharacterId(characterId: string): Promise<EmsProfile | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM common.ems_profiles WHERE character_id = $1
      `, [characterId]);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToEmsProfile(result.rows[0]);
    } catch (error) {
      console.error('Error getting EMS profile:', error);
      throw new Error('Failed to get EMS profile');
    }
  }

  async createEmsProfile(profile: CreateEmsProfileRequest): Promise<EmsProfile> {
    try {
      const result = await this.pool.query(`
        INSERT INTO common.ems_profiles (
          character_id, badge_number, rank_id, division_id, department_id,
          callsign, callsign2, status, hire_date, termination_date,
          is_active, suspended, whitelist_status, radio_channel_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `, [
        profile.characterId, profile.badgeNumber, profile.rankId, profile.divisionId, profile.departmentId,
        profile.callsign, profile.callsign2, profile.status || 'active', profile.hireDate, profile.terminationDate,
        profile.isActive !== false, profile.suspended || false, profile.whitelistStatus, profile.radioChannelId
      ]);

      return this.adaptDbToEmsProfile(result.rows[0]);
    } catch (error) {
      console.error('Error creating EMS profile:', error);
      throw new Error('Failed to create EMS profile');
    }
  }

  async updateEmsProfile(characterId: string, updates: UpdateEmsProfileRequest): Promise<EmsProfile | undefined> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Динамически строим запрос обновления (аналогично LEO)
      if (updates.badgeNumber !== undefined) {
        updateFields.push(`badge_number = $${paramIndex++}`);
        updateValues.push(updates.badgeNumber);
      }
      if (updates.rankId !== undefined) {
        updateFields.push(`rank_id = $${paramIndex++}`);
        updateValues.push(updates.rankId);
      }
      if (updates.divisionId !== undefined) {
        updateFields.push(`division_id = $${paramIndex++}`);
        updateValues.push(updates.divisionId);
      }
      if (updates.departmentId !== undefined) {
        updateFields.push(`department_id = $${paramIndex++}`);
        updateValues.push(updates.departmentId);
      }
      if (updates.callsign !== undefined) {
        updateFields.push(`callsign = $${paramIndex++}`);
        updateValues.push(updates.callsign);
      }
      if (updates.callsign2 !== undefined) {
        updateFields.push(`callsign2 = $${paramIndex++}`);
        updateValues.push(updates.callsign2);
      }
      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(updates.status);
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
      updateValues.push(characterId);

      const result = await this.pool.query(`
        UPDATE common.ems_profiles 
        SET ${updateFields.join(', ')}
        WHERE character_id = $${paramIndex++}
        RETURNING *
      `, updateValues);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToEmsProfile(result.rows[0]);
    } catch (error) {
      console.error('Error updating EMS profile:', error);
      throw new Error('Failed to update EMS profile');
    }
  }

  async deleteEmsProfile(characterId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        DELETE FROM common.ems_profiles WHERE character_id = $1
      `, [characterId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting EMS profile:', error);
      throw new Error('Failed to delete EMS profile');
    }
  }

  // ===== ОПЕРАЦИИ С ПРОФИЛЯМИ FIRE =====

  async getFireProfileByCharacterId(characterId: string): Promise<FireProfile | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM common.fire_profiles WHERE character_id = $1
      `, [characterId]);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToFireProfile(result.rows[0]);
    } catch (error) {
      console.error('Error getting FIRE profile:', error);
      throw new Error('Failed to get FIRE profile');
    }
  }

  async createFireProfile(profile: CreateFireProfileRequest): Promise<FireProfile> {
    try {
      const result = await this.pool.query(`
        INSERT INTO common.fire_profiles (
          character_id, badge_number, rank_id, division_id, department_id,
          callsign, callsign2, status, hire_date, termination_date,
          is_active, suspended, whitelist_status, radio_channel_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `, [
        profile.characterId, profile.badgeNumber, profile.rankId, profile.divisionId, profile.departmentId,
        profile.callsign, profile.callsign2, profile.status || 'active', profile.hireDate, profile.terminationDate,
        profile.isActive !== false, profile.suspended || false, profile.whitelistStatus, profile.radioChannelId
      ]);

      return this.adaptDbToFireProfile(result.rows[0]);
    } catch (error) {
      console.error('Error creating FIRE profile:', error);
      throw new Error('Failed to create FIRE profile');
    }
  }

  async updateFireProfile(characterId: string, updates: UpdateFireProfileRequest): Promise<FireProfile | undefined> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Динамически строим запрос обновления (аналогично LEO/EMS)
      if (updates.badgeNumber !== undefined) {
        updateFields.push(`badge_number = $${paramIndex++}`);
        updateValues.push(updates.badgeNumber);
      }
      if (updates.rankId !== undefined) {
        updateFields.push(`rank_id = $${paramIndex++}`);
        updateValues.push(updates.rankId);
      }
      if (updates.divisionId !== undefined) {
        updateFields.push(`division_id = $${paramIndex++}`);
        updateValues.push(updates.divisionId);
      }
      if (updates.departmentId !== undefined) {
        updateFields.push(`department_id = $${paramIndex++}`);
        updateValues.push(updates.departmentId);
      }
      if (updates.callsign !== undefined) {
        updateFields.push(`callsign = $${paramIndex++}`);
        updateValues.push(updates.callsign);
      }
      if (updates.callsign2 !== undefined) {
        updateFields.push(`callsign2 = $${paramIndex++}`);
        updateValues.push(updates.callsign2);
      }
      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(updates.status);
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
      updateValues.push(characterId);

      const result = await this.pool.query(`
        UPDATE common.fire_profiles 
        SET ${updateFields.join(', ')}
        WHERE character_id = $${paramIndex++}
        RETURNING *
      `, updateValues);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.adaptDbToFireProfile(result.rows[0]);
    } catch (error) {
      console.error('Error updating FIRE profile:', error);
      throw new Error('Failed to update FIRE profile');
    }
  }

  async deleteFireProfile(characterId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        DELETE FROM common.fire_profiles WHERE character_id = $1
      `, [characterId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting FIRE profile:', error);
      throw new Error('Failed to delete FIRE profile');
    }
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====

  async searchCharacters(query: string, limit: number = 10): Promise<Character[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM common.characters 
        WHERE 
          name ILIKE $1 OR 
          surname ILIKE $1 OR 
          phoneNumber ILIKE $1 OR
          ssn ILIKE $1
        ORDER BY 
          CASE 
            WHEN name ILIKE $1 THEN 1
            WHEN surname ILIKE $1 THEN 2
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

  async getCharactersWithFilters(filters: CharacterFilters): Promise<Character[]> {
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

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
      const offsetClause = filters.offset ? `OFFSET $${paramIndex++}` : '';

      if (filters.limit) queryParams.push(filters.limit);
      if (filters.offset) queryParams.push(filters.offset);

      const result = await this.pool.query(`
        SELECT * FROM common.characters 
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
      const result = await this.pool.query('SELECT COUNT(*) FROM common.characters');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting character count:', error);
      throw new Error('Failed to get character count');
    }
  }

  async getCharacterCountByOwner(ownerId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        'SELECT COUNT(*) FROM common.characters WHERE owner_id = $1',
        [ownerId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting character count by owner:', error);
      throw new Error('Failed to get character count by owner');
    }
  }

  async getCharacterFullName(id: string): Promise<string | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT name, surname FROM common.characters WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }

      const char = result.rows[0];
      return `${char.name} ${char.surname}`;
    } catch (error) {
      console.error('Error getting character full name:', error);
      throw new Error('Failed to get character full name');
    }
  }

  async getCharacterAge(id: string): Promise<number | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT dateOfBirth FROM common.characters WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }

      const dateOfBirth = new Date(result.rows[0].dateOfBirth);
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

  async validateCharacterData(character: CreateCharacterRequest): Promise<ValidationResult> {
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

  async getCharacterLegacyFormat(id: string): Promise<LegacyCharacter | undefined> {
    try {
      const fullCharacter = await this.getFullCharacter(id);
      if (!fullCharacter) return undefined;

      // Возвращаем в старом формате для обратной совместимости
      return {
        id: fullCharacter.id,
        firstName: fullCharacter.firstName,
        lastName: fullCharacter.lastName,
        dateOfBirth: fullCharacter.dateOfBirth,
        gender: fullCharacter.gender,
        address: fullCharacter.address,
        phoneNumber: fullCharacter.phoneNumber,
        occupation: fullCharacter.occupation,
        photoUrl: fullCharacter.photoUrl,
        ssn: fullCharacter.ssn,
        flags: fullCharacter.flags,
        addressFlags: fullCharacter.addressFlags,
        // Служебные поля из профилей
        isUnit: !!(fullCharacter.leoProfile || fullCharacter.emsProfile || fullCharacter.fireProfile),
        badgeNumber: fullCharacter.leoProfile?.badgeNumber || fullCharacter.emsProfile?.badgeNumber || fullCharacter.fireProfile?.badgeNumber,
        callsign: fullCharacter.leoProfile?.callsign || fullCharacter.emsProfile?.callsign || fullCharacter.fireProfile?.callsign,
        callsign2: fullCharacter.leoProfile?.callsign2 || fullCharacter.emsProfile?.callsign2 || fullCharacter.fireProfile?.callsign2,
        departmentId: fullCharacter.leoProfile?.departmentId || fullCharacter.emsProfile?.departmentId || fullCharacter.fireProfile?.departmentId,
        divisionId: fullCharacter.leoProfile?.divisionId || fullCharacter.emsProfile?.divisionId || fullCharacter.fireProfile?.divisionId,
        rankId: fullCharacter.leoProfile?.rankId || fullCharacter.emsProfile?.rankId || fullCharacter.fireProfile?.rankId,
        hireDate: fullCharacter.leoProfile?.hireDate || fullCharacter.emsProfile?.hireDate || fullCharacter.fireProfile?.hireDate,
        terminationDate: fullCharacter.leoProfile?.terminationDate || fullCharacter.emsProfile?.terminationDate || fullCharacter.fireProfile?.terminationDate,
        isActive: fullCharacter.leoProfile?.isActive || fullCharacter.emsProfile?.isActive || fullCharacter.fireProfile?.isActive,
        suspended: fullCharacter.leoProfile?.suspended || fullCharacter.emsProfile?.suspended || fullCharacter.fireProfile?.suspended,
        whitelistStatus: fullCharacter.leoProfile?.whitelistStatus || fullCharacter.emsProfile?.whitelistStatus || fullCharacter.fireProfile?.whitelistStatus,
        radioChannelId: fullCharacter.leoProfile?.radioChannelId || fullCharacter.emsProfile?.radioChannelId || fullCharacter.fireProfile?.radioChannelId,
        createdAt: fullCharacter.createdAt,
        updatedAt: fullCharacter.updatedAt
      };
    } catch (error) {
      console.error('Error getting character in legacy format:', error);
      throw new Error('Failed to get character in legacy format');
    }
  }
}

// Экспортируем экземпляр сервиса
export const normalizedCharacterService = new NormalizedCharacterService(); 