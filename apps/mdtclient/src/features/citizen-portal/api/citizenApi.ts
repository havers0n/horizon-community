import { mdtClient } from '@/lib/supabase';
import type { 
  Character, 
  CreateCharacterRequest, 
  UpdateCharacterRequest,
  CreateEmergencyCallRequest,
  CreateVehicleRequest,
  CreateWeaponRequest,
  Call911,
  Vehicle,
  Weapon
} from '@/shared/types';
import { DataGenerator } from '@/shared/utils/dataGeneration';

export class CitizenApi {
  // Создание персонажа
  static async createCharacter(data: CreateCharacterRequest): Promise<Character> {
    const { data: character, error } = await mdtClient
      .from('characters')
      .insert({
        ...data,
        ssn: DataGenerator.generateSSN(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return character;
  }

  // Обновление персонажа
  static async updateCharacter(id: string, data: UpdateCharacterRequest): Promise<Character> {
    const { data: character, error } = await mdtClient
      .from('characters')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return character;
  }

  // Получение персонажа по ID
  static async getCharacter(id: string): Promise<Character> {
    const { data: character, error } = await mdtClient
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw new Error(error.message);
    return character;
  }

  // Получение персонажей пользователя
  static async getUserCharacters(ownerId: string): Promise<Character[]> {
    const { data: characters, error } = await mdtClient
      .from('characters')
      .select('*')
      .eq('ownerId', ownerId)
      .order('createdAt', { ascending: false });
      
    if (error) throw new Error(error.message);
    return characters || [];
  }

  // Создание экстренного вызова
  static async createEmergencyCall(data: CreateEmergencyCallRequest): Promise<Call911> {
    const { data: call, error } = await mdtClient
      .from('mdt_calls_911')
      .insert({
        ...data,
        status: 'pending',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        units: [],
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return call;
  }

  // Регистрация транспортного средства
  static async registerVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const { data: vehicle, error } = await mdtClient
      .from('vehicles')
      .insert({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return vehicle;
  }

  // Регистрация оружия
  static async registerWeapon(data: CreateWeaponRequest): Promise<Weapon> {
    const { data: weapon, error } = await mdtClient
      .from('weapons')
      .insert({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return weapon;
  }

  // Получение транспортных средств персонажа
  static async getCharacterVehicles(ownerId: string): Promise<Vehicle[]> {
    const { data: vehicles, error } = await mdtClient
      .from('vehicles')
      .select('*')
      .eq('ownerId', ownerId)
      .order('createdAt', { ascending: false });
      
    if (error) throw new Error(error.message);
    return vehicles || [];
  }

  // Получение оружия персонажа
  static async getCharacterWeapons(ownerId: string): Promise<Weapon[]> {
    const { data: weapons, error } = await mdtClient
      .from('weapons')
      .select('*')
      .eq('ownerId', ownerId)
      .order('createdAt', { ascending: false });
      
    if (error) throw new Error(error.message);
    return weapons || [];
  }

  // Поиск персонажей
  static async searchCharacters(query: string, limit: number = 10): Promise<Character[]> {
    const { data: characters, error } = await mdtClient
      .from('characters')
      .select('*')
      .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%`)
      .limit(limit);
      
    if (error) throw new Error(error.message);
    return characters || [];
  }
} 