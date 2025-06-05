export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      parcelle: {
        Row: {
          parcelle_id: number
          code: string
          nom: string
          surface_m2: number
          type_sol: string
          pente_deg: number
          exposition: string
          date_creation: string
          geom_coordonnee: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          parcelle_id?: number
          code: string
          nom: string
          surface_m2: number
          type_sol: string
          pente_deg: number
          exposition: string
          date_creation: string
          geom_coordonnee: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          parcelle_id?: number
          code?: string
          nom?: string
          surface_m2?: number
          type_sol?: string
          pente_deg?: number
          exposition?: string
          date_creation?: string
          geom_coordonnee?: Json
          created_at?: string
          updated_at?: string
        }
      }
      espece: {
        Row: {
          espece_id: number
          nom: string
          variete: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          espece_id?: number
          nom: string
          variete: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          espece_id?: number
          nom?: string
          variete?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parcelle_espece: {
        Row: {
          parcelle_espece_id: number
          parcelle_id: number
          espece_id: number
          quantite: number
          date_plantation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          parcelle_espece_id?: number
          parcelle_id: number
          espece_id: number
          quantite: number
          date_plantation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          parcelle_espece_id?: number
          parcelle_id?: number
          espece_id?: number
          quantite?: number
          date_plantation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      type_activite: {
        Row: {
          type_activite_id: number
          code: string
          libelle: string
          description: string | null
        }
        Insert: {
          type_activite_id?: number
          code: string
          libelle: string
          description?: string | null
        }
        Update: {
          type_activite_id?: number
          code?: string
          libelle?: string
          description?: string | null
        }
      }
      activite: {
        Row: {
          activite_id: number
          parcelle_id: number
          type_activite_id: number
          date_activite: string
          operateur: string
          commentaire_general: string | null
          zone_concernee: string | null
          details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          activite_id?: number
          parcelle_id: number
          type_activite_id: number
          date_activite: string
          operateur: string
          commentaire_general?: string | null
          zone_concernee?: string | null
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          activite_id?: number
          parcelle_id?: number
          type_activite_id?: number
          date_activite?: string
          operateur?: string
          commentaire_general?: string | null
          zone_concernee?: string | null
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}