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
      groups: {
        Row: {
          id: string
          name: string
          organizer_name: string
          organizer_token: string
          created_at: string
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          organizer_name: string
          organizer_token?: string
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          organizer_name?: string
          organizer_token?: string
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          group_id: string
          person_name: string
          person_token: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          person_name: string
          person_token?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          person_name?: string
          person_token?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          menu_item_name: string
          menu_category: string
          quantity: number
          customizations: Json
          special_instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          menu_item_name: string
          menu_category: string
          quantity?: number
          customizations?: Json
          special_instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          menu_item_name?: string
          menu_category?: string
          quantity?: number
          customizations?: Json
          special_instructions?: string | null
          created_at?: string
        }
      }
    }
  }
}
