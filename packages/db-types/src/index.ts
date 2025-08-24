export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  common: {
    Tables: {
      cadet_tracks: {
        Row: {
          application_id: string | null
          created_at: string
          current_stage_id: string
          department_id: string
          id: string
          progress: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          current_stage_id: string
          department_id: string
          id?: string
          progress?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          current_stage_id?: string
          department_id?: string
          id?: string
          progress?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadet_tracks_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadet_tracks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      cadet_training_sessions: {
        Row: {
          conducted_by_user_id: string | null
          created_at: string
          id: string
          notes: string | null
          result_status_id: string | null
          track_id: string
          training_type: string
        }
        Insert: {
          conducted_by_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          result_status_id?: string | null
          track_id: string
          training_type: string
        }
        Update: {
          conducted_by_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          result_status_id?: string | null
          track_id?: string
          training_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadet_training_sessions_result_status_id_fkey"
            columns: ["result_status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadet_training_sessions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "cadet_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadet_training_sessions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "v_cadet_tracks_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      cargo_shipments: {
        Row: {
          cargo_type: string
          created_at: string | null
          destination: string
          driver_character_id: string | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          origin: string
          status_id: string
          vehicle_id: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          cargo_type: string
          created_at?: string | null
          destination: string
          driver_character_id?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          origin: string
          status_id: string
          vehicle_id?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          cargo_type?: string
          created_at?: string | null
          destination?: string
          driver_character_id?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          origin?: string
          status_id?: string
          vehicle_id?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cargo_shipments_driver_character_id_fkey"
            columns: ["driver_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_shipments_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_shipments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      character_career_history: {
        Row: {
          action_type: string
          approved_by_character_id: string | null
          character_id: string
          created_at: string | null
          department_id: string | null
          division_id: string | null
          effective_date: string
          id: string
          rank_id: string | null
          reason: string | null
          unit_id: string | null
        }
        Insert: {
          action_type: string
          approved_by_character_id?: string | null
          character_id: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Update: {
          action_type?: string
          approved_by_character_id?: string | null
          character_id?: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date?: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_career_history_approved_by_character_id_fkey"
            columns: ["approved_by_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_career_history_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_career_history_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_career_history_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_career_history_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_career_history_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      character_career_history_default: {
        Row: {
          action_type: string
          approved_by_character_id: string | null
          character_id: string
          created_at: string | null
          department_id: string | null
          division_id: string | null
          effective_date: string
          id: string
          rank_id: string | null
          reason: string | null
          unit_id: string | null
        }
        Insert: {
          action_type: string
          approved_by_character_id?: string | null
          character_id: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Update: {
          action_type?: string
          approved_by_character_id?: string | null
          character_id?: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date?: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Relationships: []
      }
      character_career_history_y2024: {
        Row: {
          action_type: string
          approved_by_character_id: string | null
          character_id: string
          created_at: string | null
          department_id: string | null
          division_id: string | null
          effective_date: string
          id: string
          rank_id: string | null
          reason: string | null
          unit_id: string | null
        }
        Insert: {
          action_type: string
          approved_by_character_id?: string | null
          character_id: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Update: {
          action_type?: string
          approved_by_character_id?: string | null
          character_id?: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date?: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Relationships: []
      }
      character_career_history_y2025: {
        Row: {
          action_type: string
          approved_by_character_id: string | null
          character_id: string
          created_at: string | null
          department_id: string | null
          division_id: string | null
          effective_date: string
          id: string
          rank_id: string | null
          reason: string | null
          unit_id: string | null
        }
        Insert: {
          action_type: string
          approved_by_character_id?: string | null
          character_id: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Update: {
          action_type?: string
          approved_by_character_id?: string | null
          character_id?: string
          created_at?: string | null
          department_id?: string | null
          division_id?: string | null
          effective_date?: string
          id?: string
          rank_id?: string | null
          reason?: string | null
          unit_id?: string | null
        }
        Relationships: []
      }
      character_licenses: {
        Row: {
          character_id: string
          expires_at: string | null
          id: string
          issued_at: string
          type: string
        }
        Insert: {
          character_id: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          type: string
        }
        Update: {
          character_id?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_licenses_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_medical_records: {
        Row: {
          character_id: string
          details: string
          id: string
          record_type: string
          recorded_at: string | null
        }
        Insert: {
          character_id: string
          details: string
          id?: string
          record_type: string
          recorded_at?: string | null
        }
        Update: {
          character_id?: string
          details?: string
          id?: string
          record_type?: string
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_medical_records_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_qualifications: {
        Row: {
          character_id: string
          created_at: string | null
          expires_date: string | null
          id: string
          issued_by_character_id: string | null
          obtained_date: string
          qualification_id: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          expires_date?: string | null
          id?: string
          issued_by_character_id?: string | null
          obtained_date: string
          qualification_id: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          expires_date?: string | null
          id?: string
          issued_by_character_id?: string | null
          obtained_date?: string
          qualification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_qualifications_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_qualifications_issued_by_character_id_fkey"
            columns: ["issued_by_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_qualifications_qualification_id_fkey"
            columns: ["qualification_id"]
            isOneToOne: false
            referencedRelation: "qualifications"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }
        Insert: {
          address?: string | null
          arrested?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          dead?: boolean | null
          ethnicity?: string | null
          eye_color?: string | null
          first_name: string
          flags?: string[] | null
          full_name?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          last_name: string
          missing?: boolean | null
          mugshot_url?: string | null
          occupation?: string | null
          phone_number?: string | null
          postal?: string | null
          ssn?: string | null
          updated_at?: string | null
          user_id: string
          weight?: string | null
        }
        Update: {
          address?: string | null
          arrested?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          dead?: boolean | null
          ethnicity?: string | null
          eye_color?: string | null
          first_name?: string
          flags?: string[] | null
          full_name?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          last_name?: string
          missing?: boolean | null
          mugshot_url?: string | null
          occupation?: string | null
          phone_number?: string | null
          postal?: string | null
          ssn?: string | null
          updated_at?: string | null
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          owner_id: string
          phone: string | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          owner_id: string
          phone?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_employees: {
        Row: {
          character_id: string
          company_id: string
          created_at: string | null
          id: string
          position: string | null
          salary: number | null
          status_id: string
        }
        Insert: {
          character_id: string
          company_id: string
          created_at?: string | null
          id?: string
          position?: string | null
          salary?: number | null
          status_id: string
        }
        Update: {
          character_id?: string
          company_id?: string
          created_at?: string | null
          id?: string
          position?: string | null
          salary?: number | null
          status_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_employees_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employees_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          full_name: string | null
          gallery: string[] | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          gallery?: string[] | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          gallery?: string[] | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      divisions: {
        Row: {
          created_at: string | null
          department_id: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "divisions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_image_likes: {
        Row: {
          created_at: string
          image_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          image_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          image_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_image_likes_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          approved_by_user_id: string | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_approved: boolean
          storage_path: string
          title: string
          uploader_user_id: string
        }
        Insert: {
          approved_by_user_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean
          storage_path: string
          title: string
          uploader_user_id: string
        }
        Update: {
          approved_by_user_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean
          storage_path?: string
          title?: string
          uploader_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      impound_lots: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      impounded_vehicles: {
        Row: {
          created_at: string | null
          fees: number | null
          id: string
          impound_date: string
          impound_lot_id: string
          impound_reason: string | null
          impounding_officer_id: string | null
          notes: string | null
          photos: string[] | null
          release_date: string | null
          release_officer_id: string | null
          status_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          fees?: number | null
          id?: string
          impound_date?: string
          impound_lot_id: string
          impound_reason?: string | null
          impounding_officer_id?: string | null
          notes?: string | null
          photos?: string[] | null
          release_date?: string | null
          release_officer_id?: string | null
          status_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          fees?: number | null
          id?: string
          impound_date?: string
          impound_lot_id?: string
          impound_reason?: string | null
          impounding_officer_id?: string | null
          notes?: string | null
          photos?: string[] | null
          release_date?: string | null
          release_officer_id?: string | null
          status_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impounded_vehicles_impound_lot_id_fkey"
            columns: ["impound_lot_id"]
            isOneToOne: false
            referencedRelation: "impound_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impounded_vehicles_impounding_officer_id_fkey"
            columns: ["impounding_officer_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impounded_vehicles_release_officer_id_fkey"
            columns: ["release_officer_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impounded_vehicles_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impounded_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          approved_by_character_id: string | null
          character_id: string
          created_at: string
          end_date: string
          id: string
          reason: string | null
          review_comment: string | null
          start_date: string
          status_id: string | null
          user_id: string
        }
        Insert: {
          approved_by_character_id?: string | null
          character_id: string
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          review_comment?: string | null
          start_date: string
          status_id?: string | null
          user_id: string
        }
        Update: {
          approved_by_character_id?: string | null
          character_id?: string
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          review_comment?: string | null
          start_date?: string
          status_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_approved_by_character_id_fkey"
            columns: ["approved_by_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          active_character_id: string | null
          badge_number: string | null
          callsign: string | null
          department_id: string
          division_id: string | null
          ended_at: string | null
          id: string
          is_primary: boolean
          practice_hours: number
          rank_id: string | null
          started_at: string
          status_id: string
          trainings_completed: number
          user_id: string
        }
        Insert: {
          active_character_id?: string | null
          badge_number?: string | null
          callsign?: string | null
          department_id: string
          division_id?: string | null
          ended_at?: string | null
          id?: string
          is_primary?: boolean
          practice_hours?: number
          rank_id?: string | null
          started_at?: string
          status_id: string
          trainings_completed?: number
          user_id: string
        }
        Update: {
          active_character_id?: string | null
          badge_number?: string | null
          callsign?: string | null
          department_id?: string
          division_id?: string | null
          ended_at?: string | null
          id?: string
          is_primary?: boolean
          practice_hours?: number
          rank_id?: string | null
          started_at?: string
          status_id?: string
          trainings_completed?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_character_id_fkey"
            columns: ["active_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      penal_codes: {
        Row: {
          category: string | null
          code_section: string
          description: string | null
          fine_amount: number | null
          id: string
          jail_time_months: number | null
          title: string
        }
        Insert: {
          category?: string | null
          code_section: string
          description?: string | null
          fine_amount?: number | null
          id?: string
          jail_time_months?: number | null
          title: string
        }
        Update: {
          category?: string | null
          code_section?: string
          description?: string | null
          fine_amount?: number | null
          id?: string
          jail_time_months?: number | null
          title?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          breed: string | null
          character_id: string
          color: string | null
          created_at: string | null
          id: string
          medical_notes: string | null
          name: string
        }
        Insert: {
          breed?: string | null
          character_id: string
          color?: string | null
          created_at?: string | null
          id?: string
          medical_notes?: string | null
          name: string
        }
        Update: {
          breed?: string | null
          character_id?: string
          color?: string | null
          created_at?: string | null
          id?: string
          medical_notes?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      qualifications: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          division_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          division_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          division_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualifications_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualifications_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          name: string
          order_index: number
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          name: string
          order_index?: number
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          name?: string
          order_index?: number
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ranks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      role_assignments: {
        Row: {
          created_at: string
          granted_by_user_id: string | null
          id: string
          role_id: string
          scope_id: string | null
          scope_type: Database["common"]["Enums"]["scope_type"]
          subject_type: string
          user_id: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          granted_by_user_id?: string | null
          id?: string
          role_id: string
          scope_id?: string | null
          scope_type?: Database["common"]["Enums"]["scope_type"]
          subject_type?: string
          user_id: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          granted_by_user_id?: string | null
          id?: string
          role_id?: string
          scope_id?: string | null
          scope_type?: Database["common"]["Enums"]["scope_type"]
          subject_type?: string
          user_id?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      status_kinds: {
        Row: {
          code: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      statuses: {
        Row: {
          code: string
          id: string
          is_active: boolean
          is_terminal: boolean
          kind_id: string
          name: string
          order_index: number
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          is_terminal?: boolean
          kind_id: string
          name: string
          order_index?: number
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          is_terminal?: boolean
          kind_id?: string
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "statuses_kind_id_fkey"
            columns: ["kind_id"]
            isOneToOne: false
            referencedRelation: "status_kinds"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_requests: {
        Row: {
          approved_by_character_id: string | null
          character_id: string
          created_at: string
          id: string
          reason: string | null
          review_comment: string | null
          source_department_id: string
          source_division_id: string | null
          status_id: string
          target_department_id: string
          target_division_id: string | null
          user_id: string
        }
        Insert: {
          approved_by_character_id?: string | null
          character_id: string
          created_at?: string
          id?: string
          reason?: string | null
          review_comment?: string | null
          source_department_id: string
          source_division_id?: string | null
          status_id: string
          target_department_id: string
          target_division_id?: string | null
          user_id: string
        }
        Update: {
          approved_by_character_id?: string | null
          character_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          review_comment?: string | null
          source_department_id?: string
          source_division_id?: string | null
          status_id?: string
          target_department_id?: string
          target_division_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_approved_by_character_id_fkey"
            columns: ["approved_by_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_source_department_id_fkey"
            columns: ["source_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_source_division_id_fkey"
            columns: ["source_division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_target_division_id_fkey"
            columns: ["target_division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string | null
          department_id: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          character_id: string
          color: string | null
          created_at: string | null
          id: string
          insurance_status_id: string
          model: string | null
          plate: string
          registration_status_id: string
          vin: string | null
        }
        Insert: {
          character_id: string
          color?: string | null
          created_at?: string | null
          id?: string
          insurance_status_id: string
          model?: string | null
          plate: string
          registration_status_id: string
          vin?: string | null
        }
        Update: {
          character_id?: string
          color?: string | null
          created_at?: string | null
          id?: string
          insurance_status_id?: string
          model?: string | null
          plate?: string
          registration_status_id?: string
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_insurance_status_id_fkey"
            columns: ["insurance_status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_registration_status_id_fkey"
            columns: ["registration_status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      weapons: {
        Row: {
          character_id: string
          created_at: string | null
          id: string
          model: string
          registration_status_id: string
          serial_number: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          id?: string
          model: string
          registration_status_id: string
          serial_number: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          id?: string
          model?: string
          registration_status_id?: string
          serial_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "weapons_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weapons_registration_status_id_fkey"
            columns: ["registration_status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      gallery_image_likes_count: {
        Row: {
          image_id: string | null
          like_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_image_likes_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
        ]
      }
      v_cadet_tracks_enriched: {
        Row: {
          application_id: string | null
          created_at: string | null
          current_stage_id: string | null
          department_id: string | null
          department_name: string | null
          id: string | null
          progress: Json | null
          stage_code: string | null
          stage_name: string | null
          updated_at: string | null
          user_id: string | null
          user_username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadet_tracks_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadet_tracks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      v_character_licenses: {
        Row: {
          character_id: string | null
          expires_at: string | null
          id: string | null
          is_valid: boolean | null
          issued_at: string | null
          type: string | null
        }
        Insert: {
          character_id?: string | null
          expires_at?: string | null
          id?: string | null
          is_valid?: never
          issued_at?: string | null
          type?: string | null
        }
        Update: {
          character_id?: string | null
          expires_at?: string | null
          id?: string | null
          is_valid?: never
          issued_at?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_licenses_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      v_effective_permissions: {
        Row: {
          permission_code: string | null
          scope_id: string | null
          scope_type: Database["common"]["Enums"]["scope_type"] | null
          user_id: string | null
        }
        Relationships: []
      }
      v_effective_roles: {
        Row: {
          display_name: string | null
          role_id: string | null
          role_name: string | null
          scope_id: string | null
          scope_type: Database["common"]["Enums"]["scope_type"] | null
          subject_type: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_gallery_image: {
        Args: {
          p_department_id?: string
          p_description: string
          p_storage_path: string
          p_title: string
          p_uploader_user_id: string
        }
        Returns: {
          approved_by_user_id: string | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_approved: boolean
          storage_path: string
          title: string
          uploader_user_id: string
        }[]
      }
      get_managed_department_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      has_permission: {
        Args: {
          p_permission_code: string
          p_scope_id?: string
          p_scope_type?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      request_status: "pending" | "approved" | "rejected" | "withdrawn"
      scope_type: "system" | "department" | "division" | "unit"
      vehicle_insurance_status: "insured" | "uninsured" | "expired"
      vehicle_registration_status:
        | "registered"
        | "unregistered"
        | "expired"
        | "stolen"
      weapon_registration_status: "registered" | "unregistered" | "confiscated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  mdt: {
    Tables: {
      application_status_history: {
        Row: {
          application_id: string
          changed_by_user_id: string | null
          comment: string | null
          created_at: string
          id: string
          status_id: string
        }
        Insert: {
          application_id: string
          changed_by_user_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          status_id: string
        }
        Update: {
          application_id?: string
          changed_by_user_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          status_id?: string
        }
        Relationships: []
      }
      bolos: {
        Row: {
          author_character_id: string
          created_at: string | null
          id: string
          location: string | null
          priority_id: string
          reason: string
          status_id: string
          subject_description: string | null
          subject_name: string | null
          type_id: string
          vehicle_description: string | null
          vehicle_plate: string | null
        }
        Insert: {
          author_character_id: string
          created_at?: string | null
          id?: string
          location?: string | null
          priority_id: string
          reason: string
          status_id: string
          subject_description?: string | null
          subject_name?: string | null
          type_id: string
          vehicle_description?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          author_character_id?: string
          created_at?: string | null
          id?: string
          location?: string | null
          priority_id?: string
          reason?: string
          status_id?: string
          subject_description?: string | null
          subject_name?: string | null
          type_id?: string
          vehicle_description?: string | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      cadet_progress: {
        Row: {
          membership_id: string
          practice_minutes: number
          trainings_completed: number
          updated_at: string | null
        }
        Insert: {
          membership_id: string
          practice_minutes?: number
          trainings_completed?: number
          updated_at?: string | null
        }
        Update: {
          membership_id?: string
          practice_minutes?: number
          trainings_completed?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      call_assignments: {
        Row: {
          assigned_at: string | null
          call_id: string
          id: string
          unit_on_duty_id: string
        }
        Insert: {
          assigned_at?: string | null
          call_id: string
          id?: string
          unit_on_duty_id: string
        }
        Update: {
          assigned_at?: string | null
          call_id?: string
          id?: string
          unit_on_duty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_assignments_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_assignments_unit_on_duty_id_fkey"
            columns: ["unit_on_duty_id"]
            isOneToOne: false
            referencedRelation: "units_on_duty"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority_id: string
          status_id: string
          type_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          description: string
          fire_info?: Json | null
          id?: string
          location: string
          patient_info?: Json | null
          priority_id: string
          status_id: string
          type_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          description?: string
          fire_info?: Json | null
          id?: string
          location?: string
          patient_info?: Json | null
          priority_id?: string
          status_id?: string
          type_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          author_character_id: string | null
          author_user_id: string
          created_at: string | null
          description: string
          evidence: string | null
          id: string
          incident_date: string
          participants: Json | null
          status_id: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          author_character_id?: string | null
          author_user_id: string
          created_at?: string | null
          description: string
          evidence?: string | null
          id?: string
          incident_date: string
          participants?: Json | null
          status_id: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          author_character_id?: string | null
          author_user_id?: string
          created_at?: string | null
          description?: string
          evidence?: string | null
          id?: string
          incident_date?: string
          participants?: Json | null
          status_id?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      duty_logs: {
        Row: {
          character_id: string
          department_id: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          start_time: string
          status: string
          user_id: string
        }
        Insert: {
          character_id: string
          department_id: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          status?: string
          user_id: string
        }
        Update: {
          character_id?: string
          department_id?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ems_reports: {
        Row: {
          id: string
          medications_administered: Json | null
          outcome: string | null
          patients: Json | null
          treatment_provided: string | null
          vital_signs: Json | null
        }
        Insert: {
          id: string
          medications_administered?: Json | null
          outcome?: string | null
          patients?: Json | null
          treatment_provided?: string | null
          vital_signs?: Json | null
        }
        Update: {
          id?: string
          medications_administered?: Json | null
          outcome?: string | null
          patients?: Json | null
          treatment_provided?: string | null
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ems_reports_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_reports: {
        Row: {
          fatalities_count: number | null
          fire_details: Json | null
          id: string
          injuries_count: number | null
          outcome: string | null
          structural_damage: string | null
        }
        Insert: {
          fatalities_count?: number | null
          fire_details?: Json | null
          id: string
          injuries_count?: number | null
          outcome?: string | null
          structural_damage?: string | null
        }
        Update: {
          fatalities_count?: number | null
          fire_details?: Json | null
          id?: string
          injuries_count?: number | null
          outcome?: string | null
          structural_damage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fd_reports_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      law_reports: {
        Row: {
          id: string
          seized_items: Json | null
        }
        Insert: {
          id: string
          seized_items?: Json | null
        }
        Update: {
          id?: string
          seized_items?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "law_reports_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      mdt_signal_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_character_id: string
          signal_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_character_id: string
          signal_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_character_id?: string
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mdt_signal_notifications_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "mdt_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      mdt_signals: {
        Row: {
          author_character_id: string | null
          coordinates: Json | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          priority_id: string | null
          title: string
          type_id: string | null
        }
        Insert: {
          author_character_id?: string | null
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          priority_id?: string | null
          title: string
          type_id?: string | null
        }
        Update: {
          author_character_id?: string | null
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          priority_id?: string | null
          title?: string
          type_id?: string | null
        }
        Relationships: []
      }
      notebook_notes: {
        Row: {
          author_character_id: string
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_character_id: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_character_id?: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      report_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          report_id: string
          uploader_user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          report_id: string
          uploader_user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          report_id?: string
          uploader_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_files_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_participants: {
        Row: {
          character_id: string
          id: string
          report_id: string
          role_in_report: string | null
        }
        Insert: {
          character_id: string
          id?: string
          report_id: string
          role_in_report?: string | null
        }
        Update: {
          character_id?: string
          id?: string
          report_id?: string
          role_in_report?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_participants_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_penal_codes: {
        Row: {
          notes: string | null
          penal_code_id: string
          report_id: string
        }
        Insert: {
          notes?: string | null
          penal_code_id: string
          report_id: string
        }
        Update: {
          notes?: string | null
          penal_code_id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_penal_codes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_template_tags: {
        Row: {
          tag_id: string
          template_id: string
        }
        Insert: {
          tag_id: string
          template_id: string
        }
        Update: {
          tag_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_template_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_template_tags_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string | null
          created_by_character_id: string | null
          department_id: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          purpose: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string | null
          created_by_character_id?: string | null
          department_id?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          purpose?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string | null
          created_by_character_id?: string | null
          department_id?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          purpose?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          author_character_id: string
          author_user_id: string
          call_id: string | null
          created_at: string
          department_id: string | null
          id: string
          incident_location: string | null
          incident_time: string | null
          reviewer_character_id: string | null
          reviewer_comment: string | null
          status_id: string
          title: string | null
          type_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_character_id: string
          author_user_id: string
          call_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          incident_location?: string | null
          incident_time?: string | null
          reviewer_character_id?: string | null
          reviewer_comment?: string | null
          status_id: string
          title?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_character_id?: string
          author_user_id?: string
          call_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          incident_location?: string | null
          incident_time?: string | null
          reviewer_character_id?: string | null
          reviewer_comment?: string | null
          status_id?: string
          title?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      units_on_duty: {
        Row: {
          character_id: string
          created_at: string | null
          current_call_id: string | null
          department_id: string
          id: string
          last_update: string | null
          location: Json | null
          status_id: string
          unit_number: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          current_call_id?: string | null
          department_id: string
          id?: string
          last_update?: string | null
          location?: Json | null
          status_id: string
          unit_number: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          current_call_id?: string | null
          department_id?: string
          id?: string
          last_update?: string | null
          location?: Json | null
          status_id?: string
          unit_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_on_duty_current_call_id_fkey"
            columns: ["current_call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_on_duty_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "awaiting_interview"
        | "awaiting_test"
        | "awaiting_practice"
        | "accepted"
        | "rejected"
        | "on_hold"
        | "awaiting_interview_time"
        | "in_training"
        | "completed"
      bolo_priority: "low" | "normal" | "high"
      bolo_status: "active" | "inactive" | "resolved"
      bolo_type: "person" | "vehicle"
      call_priority: "low" | "medium" | "high" | "urgent"
      call_status:
        | "pending"
        | "assigned"
        | "on_scene"
        | "resolved"
        | "cancelled"
      call_type: "911_police" | "911_medical" | "911_fire" | "non_emergency"
      complaint_status: "open" | "in_review" | "resolved" | "closed"
      report_status: "draft" | "submitted" | "approved" | "rejected"
      request_status: "pending" | "in_review" | "approved" | "rejected"
      support_ticket_status: "open" | "in_progress" | "closed"
      test_question_type: "single_choice" | "multiple_choice" | "text_input"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          rarity: string | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          rarity?: string | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          rarity?: string | null
        }
        Relationships: []
      }
      doc_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_internal: boolean
          parent_category_id: string | null
          sort_order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_internal?: boolean
          parent_category_id?: string | null
          sort_order?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_internal?: boolean
          parent_category_id?: string | null
          sort_order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doc_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "doc_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_category_departments: {
        Row: {
          category_id: string
          created_at: string
          department_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          department_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          department_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doc_category_departments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "doc_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      document_departments: {
        Row: {
          department_id: string
          document_id: string
        }
        Insert: {
          department_id: string
          document_id: string
        }
        Update: {
          department_id?: string
          document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_departments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          author_user_id: string | null
          category_id: string
          content: Json
          created_at: string
          id: string
          is_internal: boolean
          is_published: boolean
          slug: string
          title: string
          updated_at: string | null
          version: number
        }
        Insert: {
          author_user_id?: string | null
          category_id: string
          content: Json
          created_at?: string
          id?: string
          is_internal?: boolean
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          author_user_id?: string | null
          category_id?: string
          content?: Json
          created_at?: string
          id?: string
          is_internal?: boolean
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "doc_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      joint_positions_history: {
        Row: {
          approved_by_character_id: string | null
          character_id: string
          created_at: string | null
          end_date: string | null
          id: string
          primary_department_id: string
          reason: string | null
          review_comment: string | null
          secondary_department_id: string
          start_date: string | null
          status_id: string
          user_id: string
        }
        Insert: {
          approved_by_character_id?: string | null
          character_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          primary_department_id: string
          reason?: string | null
          review_comment?: string | null
          secondary_department_id: string
          start_date?: string | null
          status_id: string
          user_id: string
        }
        Update: {
          approved_by_character_id?: string | null
          character_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          primary_department_id?: string
          reason?: string | null
          review_comment?: string | null
          secondary_department_id?: string
          start_date?: string | null
          status_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "joint_positions_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          awarded_by_user_id: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          awarded_by_user_id?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          awarded_by_user_id?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_awarded_by_user_id_fkey"
            columns: ["awarded_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          email_notifications_enabled: boolean | null
          theme: string | null
          user_id: string
        }
        Insert: {
          email_notifications_enabled?: boolean | null
          theme?: string | null
          user_id: string
        }
        Update: {
          email_notifications_enabled?: boolean | null
          theme?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          experience: number | null
          last_activity: string | null
          level: number | null
          playtime_minutes: number | null
          reputation: number | null
          user_id: string
          warnings_admin: number | null
          warnings_game: number | null
        }
        Insert: {
          experience?: number | null
          last_activity?: string | null
          level?: number | null
          playtime_minutes?: number | null
          reputation?: number | null
          user_id: string
          warnings_admin?: number | null
          warnings_game?: number | null
        }
        Update: {
          experience?: number | null
          last_activity?: string | null
          level?: number | null
          playtime_minutes?: number | null
          reputation?: number | null
          user_id?: string
          warnings_admin?: number | null
          warnings_game?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_message_to_support_ticket: {
        Args: { p_content: string; p_ticket_id: string }
        Returns: string
      }
      approve_joint_position_request: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      approve_leave_request: {
        Args: { p_leave_id: string }
        Returns: undefined
      }
      assign_role_to_user: {
        Args: { p_role_id: string; p_user_id: string }
        Returns: undefined
      }
      can_read_doc: {
        Args: { doc_id: string }
        Returns: boolean
      }
      change_support_ticket_status: {
        Args: { p_status_code: string; p_ticket_id: string }
        Returns: undefined
      }
      create_complaint: {
        Args:
          | {
              p_description: string
              p_evidence: string
              p_incident_date: string
              p_participants: Json
              p_title: string
            }
          | {
              p_description: string
              p_evidence: string
              p_incident_date: string
              p_participants: Json
              p_title: string
              p_type: string
            }
        Returns: string
      }
      create_joint_position_request: {
        Args: { p_reason: string; p_secondary_department_id: string }
        Returns: string
      }
      create_leave_request: {
        Args: { p_end_date: string; p_reason: string; p_start_date: string }
        Returns: string
      }
      create_membership: {
        Args: {
          p_department_id: string
          p_division_id: string
          p_is_primary: boolean
          p_rank_id: string
          p_user_id: string
        }
        Returns: {
          active_character_id: string | null
          badge_number: string | null
          callsign: string | null
          department_id: string
          division_id: string | null
          ended_at: string | null
          id: string
          is_primary: boolean
          practice_hours: number
          rank_id: string | null
          started_at: string
          status_id: string
          trainings_completed: number
          user_id: string
        }[]
      }
      create_new_application: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_new_bolo: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_new_call: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_new_character: {
        Args:
          | { p_data: Json }
          | {
              p_date_of_birth: string
              p_first_name: string
              p_last_name: string
              p_ssn: string
            }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      create_new_ems_fd_report: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_new_law_report: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_new_notification: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_new_signal: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_new_test: {
        Args: { p_test_data: Json }
        Returns: Json
      }
      create_new_unit_on_duty: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_role: {
        Args: { p_description: string; p_display_name: string; p_name: string }
        Returns: {
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string
          name: string
        }[]
      }
      create_support_ticket: {
        Args: { p_initial_message: string; p_title: string }
        Returns: string
      }
      create_transfer_request: {
        Args: { p_reason: string; p_target_department_id: string }
        Returns: string
      }
      delete_bolo: {
        Args: { p_bolo_id: string }
        Returns: boolean
      }
      delete_call: {
        Args: { p_call_id: string }
        Returns: boolean
      }
      delete_character: {
        Args: { p_character_id: string }
        Returns: boolean
      }
      delete_membership: {
        Args: { p_membership_id: string }
        Returns: undefined
      }
      delete_role: {
        Args: { p_role_id: string }
        Returns: undefined
      }
      delete_unit_on_duty: {
        Args: { p_unit_id: string }
        Returns: boolean
      }
      generate_badge_number: {
        Args: { department_name: string }
        Returns: string
      }
      generate_employee_id: {
        Args: { department_name: string }
        Returns: string
      }
      get_active_bolos_with_author: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["CompositeTypes"]["bolo_with_author"][]
      }
      get_active_calls: {
        Args: Record<PropertyKey, never>
        Returns: {
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority_id: string
          status_id: string
          type_id: string
          updated_at: string | null
        }[]
      }
      get_active_signals: {
        Args: Record<PropertyKey, never>
        Returns: {
          author_character_id: string | null
          coordinates: Json | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          priority_id: string | null
          title: string
          type_id: string | null
        }[]
      }
      get_active_units: {
        Args: Record<PropertyKey, never>
        Returns: {
          character_id: string
          created_at: string | null
          current_call_id: string | null
          department_id: string
          id: string
          last_update: string | null
          location: Json | null
          status_id: string
          unit_number: string
          user_id: string
        }[]
      }
      get_admin_application_by_id: {
        Args: { p_application_id: string }
        Returns: {
          author_character_id: string
          author_name: string
          author_user_id: string
          created_at: string
          data: Json
          department_name: string
          id: string
          review_comment: string
          reviewer_user_id: string
          status_id: string
          status_name: string
          target_department_id: string
          type: string
          updated_at: string
        }[]
      }
      get_admin_applications: {
        Args: {
          p_department_id?: string
          p_limit: number
          p_page: number
          p_status_id?: string
        }
        Returns: {
          author_character_id: string
          author_name: string
          author_user_id: string
          created_at: string
          data: Json
          department_name: string
          id: string
          review_comment: string
          reviewer_user_id: string
          status_id: string
          status_name: string
          target_department_id: string
          type: string
          updated_at: string
        }[]
      }
      get_all_characters: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      get_all_departments: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          full_name: string
          gallery: string[]
          id: string
          logo_url: string
          name: string
        }[]
      }
      get_all_joint_position_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          approver_full_name: string
          created_at: string
          id: string
          primary_department_name: string
          reason: string
          requester_full_name: string
          review_comment: string
          secondary_department_name: string
          status_code: string
          status_name: string
        }[]
      }
      get_all_leave_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          approver_full_name: string
          created_at: string
          end_date: string
          id: string
          reason: string
          requester_full_name: string
          review_comment: string
          start_date: string
          status_code: string
          status_name: string
        }[]
      }
      get_all_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          code: string
          description: string
          display_name: string
          id: string
        }[]
      }
      get_all_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          display_name: string
          id: string
          name: string
        }[]
      }
      get_all_support_tickets: {
        Args: Record<PropertyKey, never>
        Returns: {
          author_username: string
          created_at: string
          id: string
          status_code: string
          status_name: string
          title: string
          updated_at: string
        }[]
      }
      get_available_departments_for_joint_position: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
        }[]
      }
      get_available_departments_for_transfer: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
        }[]
      }
      get_bolo_by_id: {
        Args: { p_bolo_id: string }
        Returns: {
          author_character_id: string
          created_at: string | null
          id: string
          location: string | null
          priority_id: string
          reason: string
          status_id: string
          subject_description: string | null
          subject_name: string | null
          type_id: string
          vehicle_description: string | null
          vehicle_plate: string | null
        }[]
      }
      get_bolos_by_author: {
        Args: { p_author_character_id: string }
        Returns: {
          author_character_id: string
          created_at: string | null
          id: string
          location: string | null
          priority_id: string
          reason: string
          status_id: string
          subject_description: string | null
          subject_name: string | null
          type_id: string
          vehicle_description: string | null
          vehicle_plate: string | null
        }[]
      }
      get_bolos_by_priority: {
        Args: { p_priority: string }
        Returns: {
          author_character_id: string
          created_at: string | null
          id: string
          location: string | null
          priority_id: string
          reason: string
          status_id: string
          subject_description: string | null
          subject_name: string | null
          type_id: string
          vehicle_description: string | null
          vehicle_plate: string | null
        }[]
      }
      get_bolos_by_type: {
        Args: { p_type: string }
        Returns: {
          author_character_id: string
          created_at: string | null
          id: string
          location: string | null
          priority_id: string
          reason: string
          status_id: string
          subject_description: string | null
          subject_name: string | null
          type_id: string
          vehicle_description: string | null
          vehicle_plate: string | null
        }[]
      }
      get_call_by_id: {
        Args: { p_call_id: string }
        Returns: {
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority_id: string
          status_id: string
          type_id: string
          updated_at: string | null
        }[]
      }
      get_calls_by_status: {
        Args: { p_status: string }
        Returns: {
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority_id: string
          status_id: string
          type_id: string
          updated_at: string | null
        }[]
      }
      get_calls_by_type: {
        Args: { p_type: string }
        Returns: {
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority_id: string
          status_id: string
          type_id: string
          updated_at: string | null
        }[]
      }
      get_character_by_id: {
        Args: { p_character_id: string }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      get_character_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_character_count_by_gender: {
        Args: { p_gender: string }
        Returns: number
      }
      get_character_count_by_owner: {
        Args: { p_owner_id: string }
        Returns: number
      }
      get_character_licenses: {
        Args: { p_character_id: string }
        Returns: Json
      }
      get_character_medical_info: {
        Args: { p_character_id: string }
        Returns: Json
      }
      get_character_with_profile: {
        Args: { p_character_id: string }
        Returns: Database["public"]["CompositeTypes"]["character_with_profile"][]
      }
      get_characters_by_age_range: {
        Args: { p_max_age: number; p_min_age: number }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      get_characters_by_birth_month: {
        Args: { p_month: number }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      get_characters_by_birth_year: {
        Args: { p_year: number }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      get_characters_with_filters: {
        Args: {
          p_gender?: string
          p_limit?: number
          p_occupation?: string
          p_offset?: number
          p_owner_id?: string
        }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      get_characters_with_profiles: {
        Args: { p_owner_id: string }
        Returns: Database["public"]["CompositeTypes"]["character_with_profile"][]
      }
      get_divisions_for_department: {
        Args: { p_department_id: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_my_characters: {
        Args: Record<PropertyKey, never> | { p_user_id: string }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      get_my_dashboard_profile: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_my_joint_position_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          approver_full_name: string
          created_at: string
          id: string
          primary_department_name: string
          reason: string
          secondary_department_name: string
          start_date: string
          status_code: string
          status_name: string
        }[]
      }
      get_my_leaves: {
        Args: Record<PropertyKey, never>
        Returns: {
          approver_full_name: string
          created_at: string
          end_date: string
          id: string
          reason: string
          start_date: string
          status_code: string
          status_name: string
        }[]
      }
      get_my_transfer_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          reason: string
          source_department_name: string
          status_code: string
          status_name: string
          target_department_name: string
        }[]
      }
      get_ranks_for_department: {
        Args: { p_department_id: string }
        Returns: {
          id: string
          name: string
          order: number
        }[]
      }
      get_role_permissions: {
        Args: { p_role_id: string }
        Returns: {
          permission_id: string
        }[]
      }
      get_signal_by_id: {
        Args: { p_signal_id: string }
        Returns: {
          author_character_id: string | null
          coordinates: Json | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          priority_id: string | null
          title: string
          type_id: string | null
        }[]
      }
      get_support_ticket_details: {
        Args: { p_ticket_id: string }
        Returns: Json
      }
      get_unit_by_id: {
        Args: { p_unit_id: string }
        Returns: {
          character_id: string
          created_at: string | null
          current_call_id: string | null
          department_id: string
          id: string
          last_update: string | null
          location: Json | null
          status_id: string
          unit_number: string
          user_id: string
        }[]
      }
      get_units_by_department: {
        Args: { p_department_id: string }
        Returns: {
          character_id: string
          created_at: string | null
          current_call_id: string | null
          department_id: string
          id: string
          last_update: string | null
          location: Json | null
          status_id: string
          unit_number: string
          user_id: string
        }[]
      }
      get_units_by_status: {
        Args: { p_status: string }
        Returns: {
          character_id: string
          created_at: string | null
          current_call_id: string | null
          department_id: string
          id: string
          last_update: string | null
          location: Json | null
          status_id: string
          unit_number: string
          user_id: string
        }[]
      }
      get_units_by_user: {
        Args: { p_user_id: string }
        Returns: {
          character_id: string
          created_at: string | null
          current_call_id: string | null
          department_id: string
          id: string
          last_update: string | null
          location: Json | null
          status_id: string
          unit_number: string
          user_id: string
        }[]
      }
      get_unread_notifications: {
        Args: { p_user_id: string }
        Returns: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean
          link: string | null
          recipient_user_id: string
        }[]
      }
      get_user_departments: {
        Args: { p_user_id: string }
        Returns: {
          division: Json
          full_name: string
          id: string
          logo_url: string
          name: string
        }[]
      }
      get_user_memberships: {
        Args: { p_user_id: string }
        Returns: {
          active_character_id: string | null
          badge_number: string | null
          callsign: string | null
          department_id: string
          division_id: string | null
          ended_at: string | null
          id: string
          is_primary: boolean
          practice_hours: number
          rank_id: string | null
          started_at: string
          status_id: string
          trainings_completed: number
          user_id: string
        }[]
      }
      get_user_notifications: {
        Args: { p_user_id: string }
        Returns: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean
          link: string | null
          recipient_user_id: string
        }[]
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_users_with_roles: {
        Args: { page?: number; page_limit?: number; search_query?: string }
        Returns: {
          email: string
          id: string
          roles: Json
          username: string
        }[]
      }
      grant_permission_to_role: {
        Args: { p_permission_id: string; p_role_id: string }
        Returns: undefined
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_guest_candidate: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      migrate_character_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      promote_candidate_to_cadet: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      reject_joint_position_request: {
        Args: { p_reason: string; p_request_id: string }
        Returns: undefined
      }
      reject_leave_request: {
        Args: { p_leave_id: string; p_rejection_reason: string }
        Returns: undefined
      }
      revoke_permission_from_role: {
        Args: { p_permission_id: string; p_role_id: string }
        Returns: undefined
      }
      revoke_role_from_user: {
        Args: { p_role_id: string; p_user_id: string }
        Returns: undefined
      }
      revoke_signal: {
        Args: { p_signal_id: string }
        Returns: boolean
      }
      search_characters: {
        Args: { p_limit?: number; p_query: string } | { p_query: string }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      transfer_character_ownership: {
        Args: { p_character_id: string; p_new_owner_id: string }
        Returns: boolean
      }
      update_application: {
        Args: { p_application_id: string; p_data: Json }
        Returns: Json
      }
      update_bolo: {
        Args: { p_bolo_id: string; p_data: Json }
        Returns: Json
      }
      update_call: {
        Args: { p_call_id: string; p_data: Json }
        Returns: Json
      }
      update_character: {
        Args: { p_character_id: string; p_updates: Json }
        Returns: {
          address: string | null
          arrested: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dead: boolean | null
          ethnicity: string | null
          eye_color: string | null
          first_name: string
          flags: string[] | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          missing: boolean | null
          mugshot_url: string | null
          occupation: string | null
          phone_number: string | null
          postal: string | null
          ssn: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }[]
      }
      update_character_licenses: {
        Args: { p_character_id: string; p_new_licenses: Json }
        Returns: Json
      }
      update_character_medical_info: {
        Args: { p_character_id: string; p_new_medical_info: Json }
        Returns: Json
      }
      update_membership: {
        Args: {
          p_department_id: string
          p_division_id: string
          p_is_primary: boolean
          p_membership_id: string
          p_rank_id: string
        }
        Returns: {
          active_character_id: string | null
          badge_number: string | null
          callsign: string | null
          department_id: string
          division_id: string | null
          ended_at: string | null
          id: string
          is_primary: boolean
          practice_hours: number
          rank_id: string | null
          started_at: string
          status_id: string
          trainings_completed: number
          user_id: string
        }[]
      }
      update_role: {
        Args: {
          p_description: string
          p_display_name: string
          p_role_id: string
        }
        Returns: {
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string
          name: string
        }[]
      }
      update_signal: {
        Args: { p_data: Json; p_signal_id: string }
        Returns: Json
      }
      update_unit_on_duty: {
        Args: { p_data: Json; p_unit_id: string }
        Returns: Json
      }
      validate_character_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          character_id: number
          validation_errors: string[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      bolo_with_author: {
        id: string | null
        type: string | null
        reason: string | null
        status: string | null
        location: string | null
        priority: string | null
        created_at: string | null
        subject_name: string | null
        subject_description: string | null
        vehicle_plate: string | null
        vehicle_description: string | null
        author_character_id: string | null
        author_full_name: string | null
      }
      character_with_profile: {
        id: string | null
        owner_id: string | null
        first_name: string | null
        last_name: string | null
        date_of_birth: string | null
        gender: string | null
        phone_number: string | null
        address: string | null
        occupation: string | null
        ssn: string | null
        licenses: Json | null
        medical_info: Json | null
        mugshot_url: string | null
        flags: string[] | null
        created_at: string | null
        updated_at: string | null
        profile_id: string | null
        profile_username: string | null
        profile_email: string | null
        profile_role: string | null
      }
    }
  }
  system: {
    Tables: {
      applications: {
        Row: {
          author_character_id: string | null
          author_user_id: string
          created_at: string
          data: Json | null
          id: string
          review_comment: string | null
          reviewer_user_id: string | null
          status_id: string
          target_department_id: string
          type: string
          updated_at: string
        }
        Insert: {
          author_character_id?: string | null
          author_user_id: string
          created_at?: string
          data?: Json | null
          id?: string
          review_comment?: string | null
          reviewer_user_id?: string | null
          status_id: string
          target_department_id: string
          type: string
          updated_at?: string
        }
        Update: {
          author_character_id?: string | null
          author_user_id?: string
          created_at?: string
          data?: Json | null
          id?: string
          review_comment?: string | null
          reviewer_user_id?: string | null
          status_id?: string
          target_department_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean
          link: string | null
          recipient_user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_user_id?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          attachment_url: string | null
          author_user_id: string
          content: string | null
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          attachment_url?: string | null
          author_user_id: string
          content?: string | null
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          attachment_url?: string | null
          author_user_id?: string
          content?: string | null
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          author_user_id: string
          created_at: string | null
          handler_user_id: string | null
          id: string
          status_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_user_id: string
          created_at?: string | null
          handler_user_id?: string | null
          id?: string
          status_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_user_id?: string
          created_at?: string | null
          handler_user_id?: string | null
          id?: string
          status_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_question_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          option_text: string
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text: string
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "test_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          created_at: string
          id: string
          order_index: number
          question_text: string
          question_type: string
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          question_text: string
          question_type?: string
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          question_text?: string
          question_type?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          answers: Json | null
          created_at: string | null
          id: string
          max_score: number | null
          passed: boolean | null
          percentage: number | null
          score: number | null
          session_id: string
          test_id: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          score?: number | null
          session_id: string
          test_id: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          score?: number | null
          session_id?: string
          test_id?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          application_id: string | null
          end_time: string | null
          focus_losses_count: number
          id: string
          start_time: string | null
          status_id: string
          test_id: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          end_time?: string | null
          focus_losses_count?: number
          id?: string
          start_time?: string | null
          status_id: string
          test_id: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          end_time?: string | null
          focus_losses_count?: number
          id?: string
          start_time?: string | null
          status_id?: string
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "my_applications_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "v_admin_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          max_focus_losses: number
          passing_score_percent: number
          purpose: Database["system"]["Enums"]["test_purpose_enum"]
          target_department_id: string | null
          target_qualification_id: string | null
          target_rank_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          max_focus_losses?: number
          passing_score_percent?: number
          purpose?: Database["system"]["Enums"]["test_purpose_enum"]
          target_department_id?: string | null
          target_qualification_id?: string | null
          target_rank_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          max_focus_losses?: number
          passing_score_percent?: number
          purpose?: Database["system"]["Enums"]["test_purpose_enum"]
          target_department_id?: string | null
          target_qualification_id?: string | null
          target_rank_id?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      my_applications_view: {
        Row: {
          created_at: string | null
          department_name: string | null
          details: Json | null
          id: string | null
          status_code: string | null
          status_name: string | null
          type: string | null
          type_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_admin_applications: {
        Row: {
          author_character_id: string | null
          author_name: string | null
          author_user_id: string | null
          created_at: string | null
          data: Json | null
          department_name: string | null
          id: string | null
          review_comment: string | null
          reviewer_user_id: string | null
          status_id: string | null
          status_name: string | null
          target_department_id: string | null
          type: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      test_purpose: "entry" | "promotion" | "qualification"
      test_purpose_enum: "entry" | "promotion" | "qualification"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  common: {
    Enums: {
      request_status: ["pending", "approved", "rejected", "withdrawn"],
      scope_type: ["system", "department", "division", "unit"],
      vehicle_insurance_status: ["insured", "uninsured", "expired"],
      vehicle_registration_status: [
        "registered",
        "unregistered",
        "expired",
        "stolen",
      ],
      weapon_registration_status: ["registered", "unregistered", "confiscated"],
    },
  },
  mdt: {
    Enums: {
      application_status: [
        "awaiting_interview",
        "awaiting_test",
        "awaiting_practice",
        "accepted",
        "rejected",
        "on_hold",
        "awaiting_interview_time",
        "in_training",
        "completed",
      ],
      bolo_priority: ["low", "normal", "high"],
      bolo_status: ["active", "inactive", "resolved"],
      bolo_type: ["person", "vehicle"],
      call_priority: ["low", "medium", "high", "urgent"],
      call_status: ["pending", "assigned", "on_scene", "resolved", "cancelled"],
      call_type: ["911_police", "911_medical", "911_fire", "non_emergency"],
      complaint_status: ["open", "in_review", "resolved", "closed"],
      report_status: ["draft", "submitted", "approved", "rejected"],
      request_status: ["pending", "in_review", "approved", "rejected"],
      support_ticket_status: ["open", "in_progress", "closed"],
      test_question_type: ["single_choice", "multiple_choice", "text_input"],
    },
  },
  public: {
    Enums: {},
  },
  system: {
    Enums: {
      test_purpose: ["entry", "promotion", "qualification"],
      test_purpose_enum: ["entry", "promotion", "qualification"],
    },
  },
} as const
