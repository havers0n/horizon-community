// --- НОВЫЙ КОД (100% правильный) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем правильную схему `mdt` и имя таблицы `report_templates`
export type ReportTemplate = Database['mdt']['Tables']['report_templates']['Row']
export type ReportTemplateInsert = Database['mdt']['Tables']['report_templates']['Insert']
export type ReportTemplateUpdate = Database['mdt']['Tables']['report_templates']['Update']

// Export any report-specific types or utilities
export * from './model'