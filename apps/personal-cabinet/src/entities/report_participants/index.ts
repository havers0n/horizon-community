// Этот файл описывает сущность "Участник Отчета"

import type { Database } from '@roleplay-identity/db-types'

// Указываем правильную схему `mdt` и имя таблицы `report_participants`
export type ReportParticipant = Database['mdt']['Tables']['report_participants']['Row']
export type ReportParticipantInsert = Database['mdt']['Tables']['report_participants']['Insert']
export type ReportParticipantUpdate = Database['mdt']['Tables']['report_participants']['Update']