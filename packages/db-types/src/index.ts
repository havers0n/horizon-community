export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  common: {
    Tables: {
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
          status: string
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
          status?: string
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
          status?: string
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          last_name: string
          licenses?: Json | null
          medical_info?: Json | null
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
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          last_name?: string
          licenses?: Json | null
          medical_info?: Json | null
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
          status: string | null
        }
        Insert: {
          character_id: string
          company_id: string
          created_at?: string | null
          id?: string
          position?: string | null
          salary?: number | null
          status?: string | null
        }
        Update: {
          character_id?: string
          company_id?: string
          created_at?: string | null
          id?: string
          position?: string | null
          salary?: number | null
          status?: string | null
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
      ems_profiles: {
        Row: {
          created_at: string | null
          department_id: string
          division_id: string | null
          id: string
          rank_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          division_id?: string | null
          id: string
          rank_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          division_id?: string | null
          id?: string
          rank_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ems_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ems_profiles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ems_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ems_profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
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
          status: string
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
          status?: string
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
          status?: string
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
            foreignKeyName: "impounded_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      leo_profiles: {
        Row: {
          badge_number: string | null
          callsign: string | null
          callsign2: string | null
          created_at: string | null
          department_id: string
          division_id: string | null
          id: string
          rank_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          badge_number?: string | null
          callsign?: string | null
          callsign2?: string | null
          created_at?: string | null
          department_id: string
          division_id?: string | null
          id: string
          rank_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          badge_number?: string | null
          callsign?: string | null
          callsign2?: string | null
          created_at?: string | null
          department_id?: string
          division_id?: string | null
          id?: string
          rank_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leo_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leo_profiles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leo_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leo_profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
        ]
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
          insurance_status:
            | Database["common"]["Enums"]["vehicle_insurance_status"]
            | null
          model: string | null
          plate: string
          registration_status:
            | Database["common"]["Enums"]["vehicle_registration_status"]
            | null
          vin: string | null
        }
        Insert: {
          character_id: string
          color?: string | null
          created_at?: string | null
          id?: string
          insurance_status?:
            | Database["common"]["Enums"]["vehicle_insurance_status"]
            | null
          model?: string | null
          plate: string
          registration_status?:
            | Database["common"]["Enums"]["vehicle_registration_status"]
            | null
          vin?: string | null
        }
        Update: {
          character_id?: string
          color?: string | null
          created_at?: string | null
          id?: string
          insurance_status?:
            | Database["common"]["Enums"]["vehicle_insurance_status"]
            | null
          model?: string | null
          plate?: string
          registration_status?:
            | Database["common"]["Enums"]["vehicle_registration_status"]
            | null
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
        ]
      }
      weapons: {
        Row: {
          character_id: string
          created_at: string | null
          id: string
          model: string
          registration_status:
            | Database["common"]["Enums"]["weapon_registration_status"]
            | null
          serial_number: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          id?: string
          model: string
          registration_status?:
            | Database["common"]["Enums"]["weapon_registration_status"]
            | null
          serial_number: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          id?: string
          model?: string
          registration_status?:
            | Database["common"]["Enums"]["weapon_registration_status"]
            | null
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  mdt: {
    Tables: {
      applications: {
        Row: {
          author_character_id: string
          author_user_id: string
          created_at: string | null
          data: Json | null
          id: string
          result: Json | null
          review_comment: string | null
          reviewer_character_id: string | null
          status: Database["mdt"]["Enums"]["application_status"]
          status_history: Json[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          author_character_id: string
          author_user_id: string
          created_at?: string | null
          data?: Json | null
          id?: string
          result?: Json | null
          review_comment?: string | null
          reviewer_character_id?: string | null
          status?: Database["mdt"]["Enums"]["application_status"]
          status_history?: Json[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          author_character_id?: string
          author_user_id?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          result?: Json | null
          review_comment?: string | null
          reviewer_character_id?: string | null
          status?: Database["mdt"]["Enums"]["application_status"]
          status_history?: Json[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bolos: {
        Row: {
          author_character_id: string
          created_at: string | null
          id: string
          location: string | null
          priority: Database["mdt"]["Enums"]["bolo_priority"] | null
          reason: string
          status: Database["mdt"]["Enums"]["bolo_status"] | null
          subject_description: string | null
          subject_name: string | null
          type: Database["mdt"]["Enums"]["bolo_type"]
          vehicle_description: string | null
          vehicle_plate: string | null
        }
        Insert: {
          author_character_id: string
          created_at?: string | null
          id?: string
          location?: string | null
          priority?: Database["mdt"]["Enums"]["bolo_priority"] | null
          reason: string
          status?: Database["mdt"]["Enums"]["bolo_status"] | null
          subject_description?: string | null
          subject_name?: string | null
          type: Database["mdt"]["Enums"]["bolo_type"]
          vehicle_description?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          author_character_id?: string
          created_at?: string | null
          id?: string
          location?: string | null
          priority?: Database["mdt"]["Enums"]["bolo_priority"] | null
          reason?: string
          status?: Database["mdt"]["Enums"]["bolo_status"] | null
          subject_description?: string | null
          subject_name?: string | null
          type?: Database["mdt"]["Enums"]["bolo_type"]
          vehicle_description?: string | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      calls: {
        Row: {
          assigned_units: Json | null
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority: Database["mdt"]["Enums"]["call_priority"] | null
          status: Database["mdt"]["Enums"]["call_status"]
          type: Database["mdt"]["Enums"]["call_type"]
          updated_at: string | null
        }
        Insert: {
          assigned_units?: Json | null
          attachments?: Json | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          description: string
          fire_info?: Json | null
          id?: string
          location: string
          patient_info?: Json | null
          priority?: Database["mdt"]["Enums"]["call_priority"] | null
          status?: Database["mdt"]["Enums"]["call_status"]
          type: Database["mdt"]["Enums"]["call_type"]
          updated_at?: string | null
        }
        Update: {
          assigned_units?: Json | null
          attachments?: Json | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          description?: string
          fire_info?: Json | null
          id?: string
          location?: string
          patient_info?: Json | null
          priority?: Database["mdt"]["Enums"]["call_priority"] | null
          status?: Database["mdt"]["Enums"]["call_status"]
          type?: Database["mdt"]["Enums"]["call_type"]
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
          status: Database["mdt"]["Enums"]["complaint_status"]
          title: string
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
          status?: Database["mdt"]["Enums"]["complaint_status"]
          title: string
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
          status?: Database["mdt"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ems_fd_reports: {
        Row: {
          author_character_id: string
          call_id: string | null
          created_at: string | null
          description: string
          fire_details: Json | null
          id: string
          incident_location: string
          incident_time: string
          incident_type: string
          medications_administered: Json | null
          outcome: string | null
          patients: Json | null
          title: string
          treatment_provided: string | null
          updated_at: string | null
          vital_signs: Json | null
        }
        Insert: {
          author_character_id: string
          call_id?: string | null
          created_at?: string | null
          description: string
          fire_details?: Json | null
          id?: string
          incident_location: string
          incident_time: string
          incident_type: string
          medications_administered?: Json | null
          outcome?: string | null
          patients?: Json | null
          title: string
          treatment_provided?: string | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Update: {
          author_character_id?: string
          call_id?: string | null
          created_at?: string | null
          description?: string
          fire_details?: Json | null
          id?: string
          incident_location?: string
          incident_time?: string
          incident_type?: string
          medications_administered?: Json | null
          outcome?: string | null
          patients?: Json | null
          title?: string
          treatment_provided?: string | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ems_fd_reports_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      law_reports: {
        Row: {
          author_character_id: string
          call_id: string | null
          created_at: string | null
          description: string
          id: string
          incident_location: string
          incident_time: string
          incident_type: string
          penal_codes: Json | null
          seized_items: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_character_id: string
          call_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          incident_location: string
          incident_time: string
          incident_type: string
          penal_codes?: Json | null
          seized_items?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_character_id?: string
          call_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          incident_location?: string
          incident_time?: string
          incident_type?: string
          penal_codes?: Json | null
          seized_items?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "law_reports_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
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
          priority: string | null
          title: string
          type: string | null
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
          priority?: string | null
          title: string
          type?: string | null
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
          priority?: string | null
          title?: string
          type?: string | null
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
            referencedRelation: "law_reports"
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
          tags: string[] | null
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
          tags?: string[] | null
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
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          author_user_id: string
          created_at: string | null
          handler_user_id: string | null
          id: string
          messages: Json[] | null
          status: Database["mdt"]["Enums"]["support_ticket_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          author_user_id: string
          created_at?: string | null
          handler_user_id?: string | null
          id?: string
          messages?: Json[] | null
          status?: Database["mdt"]["Enums"]["support_ticket_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          author_user_id?: string
          created_at?: string | null
          handler_user_id?: string | null
          id?: string
          messages?: Json[] | null
          status?: Database["mdt"]["Enums"]["support_ticket_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          answers: Json | null
          comment: string | null
          created_at: string | null
          id: string
          max_score: number | null
          passed: boolean | null
          percentage: number | null
          score: number | null
          session_id: string
          status: string | null
          test_id: string
          time_spent_seconds: number | null
          time_taken: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          score?: number | null
          session_id: string
          status?: string | null
          test_id: string
          time_spent_seconds?: number | null
          time_taken?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          score?: number | null
          session_id?: string
          status?: string | null
          test_id?: string
          time_spent_seconds?: number | null
          time_taken?: number | null
          updated_at?: string | null
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
          created_at: string | null
          end_time: string | null
          id: string
          start_time: string | null
          status: string
          test_id: string
          time_limit: number | null
          updated_at: string | null
          user_id: string
          violation_reason: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          status: string
          test_id: string
          time_limit?: number | null
          updated_at?: string | null
          user_id: string
          violation_reason?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          status?: string
          test_id?: string
          time_limit?: number | null
          updated_at?: string | null
          user_id?: string
          violation_reason?: string | null
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
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          passing_score: number | null
          questions: Json | null
          required_application_type: string | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          questions?: Json | null
          required_application_type?: string | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          questions?: Json | null
          required_application_type?: string | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
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
          status: string
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
          status: string
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
          status?: string
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
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "awaiting_interview"
        | "awaiting_test"
        | "awaiting_practice"
        | "accepted"
        | "rejected"
        | "on_hold"
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
      support_ticket_status: "open" | "in_progress" | "closed"
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
      joint_positions_history: {
        Row: {
          approved_by_character_id: string | null
          character_id: string
          created_at: string | null
          end_date: string | null
          id: string
          primary_department_id: string
          reason: string | null
          secondary_department_id: string
          start_date: string | null
          status: string | null
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
          secondary_department_id: string
          start_date?: string | null
          status?: string | null
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
          secondary_department_id?: string
          start_date?: string | null
          status?: string | null
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
          role: Database["public"]["Enums"]["user_role"]
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
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
              p_first_name: string
              p_last_name: string
              p_date_of_birth: string
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
      create_new_unit_on_duty: {
        Args: { p_data: Json }
        Returns: Json
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
          assigned_units: Json | null
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority: Database["mdt"]["Enums"]["call_priority"] | null
          status: Database["mdt"]["Enums"]["call_status"]
          type: Database["mdt"]["Enums"]["call_type"]
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
          priority: string | null
          title: string
          type: string | null
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
          status: string
          unit_number: string
          user_id: string
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          id: string
          name: string
          full_name: string
          logo_url: string
          description: string
          gallery: string[]
        }[]
      }
      get_bolo_by_id: {
        Args: { p_bolo_id: string }
        Returns: {
          author_character_id: string
          created_at: string | null
          id: string
          location: string | null
          priority: Database["mdt"]["Enums"]["bolo_priority"] | null
          reason: string
          status: Database["mdt"]["Enums"]["bolo_status"] | null
          subject_description: string | null
          subject_name: string | null
          type: Database["mdt"]["Enums"]["bolo_type"]
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
          priority: Database["mdt"]["Enums"]["bolo_priority"] | null
          reason: string
          status: Database["mdt"]["Enums"]["bolo_status"] | null
          subject_description: string | null
          subject_name: string | null
          type: Database["mdt"]["Enums"]["bolo_type"]
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
          priority: Database["mdt"]["Enums"]["bolo_priority"] | null
          reason: string
          status: Database["mdt"]["Enums"]["bolo_status"] | null
          subject_description: string | null
          subject_name: string | null
          type: Database["mdt"]["Enums"]["bolo_type"]
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
          priority: Database["mdt"]["Enums"]["bolo_priority"] | null
          reason: string
          status: Database["mdt"]["Enums"]["bolo_status"] | null
          subject_description: string | null
          subject_name: string | null
          type: Database["mdt"]["Enums"]["bolo_type"]
          vehicle_description: string | null
          vehicle_plate: string | null
        }[]
      }
      get_call_by_id: {
        Args: { p_call_id: string }
        Returns: {
          assigned_units: Json | null
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority: Database["mdt"]["Enums"]["call_priority"] | null
          status: Database["mdt"]["Enums"]["call_status"]
          type: Database["mdt"]["Enums"]["call_type"]
          updated_at: string | null
        }[]
      }
      get_calls_by_status: {
        Args: { p_status: string }
        Returns: {
          assigned_units: Json | null
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority: Database["mdt"]["Enums"]["call_priority"] | null
          status: Database["mdt"]["Enums"]["call_status"]
          type: Database["mdt"]["Enums"]["call_type"]
          updated_at: string | null
        }[]
      }
      get_calls_by_type: {
        Args: { p_type: string }
        Returns: {
          assigned_units: Json | null
          attachments: Json | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          description: string
          fire_info: Json | null
          id: string
          location: string
          patient_info: Json | null
          priority: Database["mdt"]["Enums"]["call_priority"] | null
          status: Database["mdt"]["Enums"]["call_status"]
          type: Database["mdt"]["Enums"]["call_type"]
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
        Args: { p_min_age: number; p_max_age: number }
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          p_owner_id?: string
          p_gender?: string
          p_occupation?: string
          p_limit?: number
          p_offset?: number
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          priority: string | null
          title: string
          type: string | null
        }[]
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
          status: string
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
          status: string
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
          status: string
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
          status: string
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
      revoke_signal: {
        Args: { p_signal_id: string }
        Returns: boolean
      }
      search_characters: {
        Args: { p_query: string } | { p_query: string; p_limit?: number }
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_name: string
          licenses: Json | null
          medical_info: Json | null
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
      update_signal: {
        Args: { p_signal_id: string; p_data: Json }
        Returns: Json
      }
      update_unit_on_duty: {
        Args: { p_unit_id: string; p_data: Json }
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
      user_role: "citizen" | "candidate" | "staff" | "admin"
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
  graphql_public: {
    Enums: {},
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
      ],
      bolo_priority: ["low", "normal", "high"],
      bolo_status: ["active", "inactive", "resolved"],
      bolo_type: ["person", "vehicle"],
      call_priority: ["low", "medium", "high", "urgent"],
      call_status: ["pending", "assigned", "on_scene", "resolved", "cancelled"],
      call_type: ["911_police", "911_medical", "911_fire", "non_emergency"],
      complaint_status: ["open", "in_review", "resolved", "closed"],
      support_ticket_status: ["open", "in_progress", "closed"],
    },
  },
  public: {
    Enums: {
      user_role: ["citizen", "candidate", "staff", "admin"],
    },
  },
} as const
