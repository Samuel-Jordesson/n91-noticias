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
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'editor' | 'user' | 'dev'
          avatar_url: string | null
          bio: string | null
          social_links: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'admin' | 'editor' | 'user' | 'dev'
          avatar_url?: string | null
          bio?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'editor' | 'user' | 'dev'
          avatar_url?: string | null
          bio?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          excerpt: string
          content: string
          image_url: string
          category_id: string | null
          author_id: string | null
          is_breaking: boolean
          is_published: boolean
          views: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          excerpt: string
          content: string
          image_url: string
          category_id?: string | null
          author_id?: string | null
          is_breaking?: boolean
          is_published?: boolean
          views?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string
          content?: string
          image_url?: string
          category_id?: string | null
          author_id?: string | null
          is_breaking?: boolean
          is_published?: boolean
          views?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_name: string
          author_email: string | null
          content: string
          likes: number
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_name: string
          author_email?: string | null
          content: string
          likes?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_name?: string
          author_email?: string | null
          content?: string
          likes?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ads: {
        Row: {
          id: string
          title: string
          image_url: string
          link: string
          position: 'sidebar' | 'banner' | 'inline'
          is_active: boolean
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          link: string
          position: 'sidebar' | 'banner' | 'inline'
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          link?: string
          position?: 'sidebar' | 'banner' | 'inline'
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company_name: string
          description: string
          image_url: string | null
          application_link: string | null
          location: string | null
          salary: string | null
          employment_type: string | null
          is_published: boolean
          is_featured: boolean
          views: number
          author_id: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company_name: string
          description: string
          image_url?: string | null
          application_link?: string | null
          location?: string | null
          salary?: string | null
          employment_type?: string | null
          is_published?: boolean
          is_featured?: boolean
          views?: number
          author_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company_name?: string
          description?: string
          image_url?: string | null
          application_link?: string | null
          location?: string | null
          salary?: string | null
          employment_type?: string | null
          is_published?: boolean
          is_featured?: boolean
          views?: number
          author_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
