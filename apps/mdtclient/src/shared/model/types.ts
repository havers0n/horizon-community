// Глобальные типы для всего приложения
import type { Citizen, Vehicle, Weapon, Unit, User, Call911 } from '../types';

export type Gender = 'male' | 'female' | 'other';





export interface LawReport {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  type: string;
  status: string;
  [key: string]: any;
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  ownerId: string;
  medicalRecords?: any[];
  [key: string]: any;
}