/**
 * Database types for the Raid VISION project.
 *
 * All application data lives in the `raid_db` schema — never in `public`.
 *
 * This file is regenerated with:
 *   npx supabase gen types typescript --linked > src/types/database.types.ts
 * (adjust the output path to match this repository).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  raid_db: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          display_name: string | null;
          role: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          role?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string | null;
          role?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      categories: {
        Row: {
          id: string;
          slug: string;
          name_i18n: Json;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_i18n?: Json;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_i18n?: Json;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          service_id: string | null;
          budget: string | null;
          project_date: string | null;
          message: string;
          status: string;
          honeypot: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          service_id?: string | null;
          budget?: string | null;
          project_date?: string | null;
          message: string;
          status?: string;
          honeypot?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          service_id?: string | null;
          budget?: string | null;
          project_date?: string | null;
          message?: string;
          status?: string;
          honeypot?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_messages_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };

      gallery_items: {
        Row: {
          id: string;
          item_type: string;
          title_i18n: Json;
          caption_i18n: Json;
          storage_path: string | null;
          poster_path: string | null;
          instagram_url: string | null;
          external_url: string | null;
          linked_project_id: string | null;
          featured: boolean;
          published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_type?: string;
          title_i18n?: Json;
          caption_i18n?: Json;
          storage_path?: string | null;
          poster_path?: string | null;
          instagram_url?: string | null;
          external_url?: string | null;
          linked_project_id?: string | null;
          featured?: boolean;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_type?: string;
          title_i18n?: Json;
          caption_i18n?: Json;
          storage_path?: string | null;
          poster_path?: string | null;
          instagram_url?: string | null;
          external_url?: string | null;
          linked_project_id?: string | null;
          featured?: boolean;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_items_linked_project_id_fkey";
            columns: ["linked_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };

      project_categories: {
        Row: {
          project_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          project_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          category_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_categories_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };

      project_media: {
        Row: {
          id: string;
          project_id: string;
          media_type: string;
          storage_path: string | null;
          poster_path: string | null;
          external_url: string | null;
          alt_i18n: Json;
          caption_i18n: Json;
          aspect_ratio: string;
          autoplay: boolean;
          muted: boolean;
          loop: boolean;
          featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          media_type?: string;
          storage_path?: string | null;
          poster_path?: string | null;
          external_url?: string | null;
          alt_i18n?: Json;
          caption_i18n?: Json;
          aspect_ratio?: string;
          autoplay?: boolean;
          muted?: boolean;
          loop?: boolean;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          media_type?: string;
          storage_path?: string | null;
          poster_path?: string | null;
          external_url?: string | null;
          alt_i18n?: Json;
          caption_i18n?: Json;
          aspect_ratio?: string;
          autoplay?: boolean;
          muted?: boolean;
          loop?: boolean;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };

      project_sections: {
        Row: {
          id: string;
          project_id: string;
          section_type: string;
          heading_i18n: Json;
          body_i18n: Json;
          metadata: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          section_type?: string;
          heading_i18n?: Json;
          body_i18n?: Json;
          metadata?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          section_type?: string;
          heading_i18n?: Json;
          body_i18n?: Json;
          metadata?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_sections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };

      projects: {
        Row: {
          id: string;
          slug: string;
          title_i18n: Json;
          summary_i18n: Json;
          client_name: string | null;
          year: number | null;
          cover_type: string;
          cover_media_path: string | null;
          cover_poster_path: string | null;
          status: string;
          featured: boolean;
          sort_order: number;
          seo_title_i18n: Json;
          seo_description_i18n: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_i18n?: Json;
          summary_i18n?: Json;
          client_name?: string | null;
          year?: number | null;
          cover_type?: string;
          cover_media_path?: string | null;
          cover_poster_path?: string | null;
          status?: string;
          featured?: boolean;
          sort_order?: number;
          seo_title_i18n?: Json;
          seo_description_i18n?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_i18n?: Json;
          summary_i18n?: Json;
          client_name?: string | null;
          year?: number | null;
          cover_type?: string;
          cover_media_path?: string | null;
          cover_poster_path?: string | null;
          status?: string;
          featured?: boolean;
          sort_order?: number;
          seo_title_i18n?: Json;
          seo_description_i18n?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      service_features: {
        Row: {
          id: string;
          service_id: string;
          label_i18n: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          label_i18n?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          label_i18n?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_features_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };

      service_packages: {
        Row: {
          id: string;
          service_id: string;
          name_i18n: Json;
          description_i18n: Json;
          price: number | null;
          currency: string;
          featured: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          name_i18n?: Json;
          description_i18n?: Json;
          price?: number | null;
          currency?: string;
          featured?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          name_i18n?: Json;
          description_i18n?: Json;
          price?: number | null;
          currency?: string;
          featured?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };

      services: {
        Row: {
          id: string;
          slug: string;
          name_i18n: Json;
          short_description_i18n: Json;
          description_i18n: Json;
          price_type: string;
          price: number | null;
          max_price: number | null;
          currency: string;
          unit_i18n: Json;
          featured: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_i18n?: Json;
          short_description_i18n?: Json;
          description_i18n?: Json;
          price_type?: string;
          price?: number | null;
          max_price?: number | null;
          currency?: string;
          unit_i18n?: Json;
          featured?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_i18n?: Json;
          short_description_i18n?: Json;
          description_i18n?: Json;
          price_type?: string;
          price?: number | null;
          max_price?: number | null;
          currency?: string;
          unit_i18n?: Json;
          featured?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      site_settings: {
        Row: {
          singleton: boolean;
          brand_name: string;
          owner_name: string | null;
          tagline_i18n: Json;
          short_intro_i18n: Json;
          bio_i18n: Json;
          location_i18n: Json;
          email: string | null;
          phone: string | null;
          whatsapp_url: string | null;
          instagram_url: string | null;
          youtube_url: string | null;
          vimeo_url: string | null;
          tiktok_url: string | null;
          hero_video_path: string | null;
          hero_poster_path: string | null;
          showreel_video_path: string | null;
          showreel_poster_path: string | null;
          availability_status: string;
          default_currency: string;
          seo_title_i18n: Json;
          seo_description_i18n: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          singleton?: boolean;
          brand_name?: string;
          owner_name?: string | null;
          tagline_i18n?: Json;
          short_intro_i18n?: Json;
          bio_i18n?: Json;
          location_i18n?: Json;
          email?: string | null;
          phone?: string | null;
          whatsapp_url?: string | null;
          instagram_url?: string | null;
          youtube_url?: string | null;
          vimeo_url?: string | null;
          tiktok_url?: string | null;
          hero_video_path?: string | null;
          hero_poster_path?: string | null;
          showreel_video_path?: string | null;
          showreel_poster_path?: string | null;
          availability_status?: string;
          default_currency?: string;
          seo_title_i18n?: Json;
          seo_description_i18n?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          singleton?: boolean;
          brand_name?: string;
          owner_name?: string | null;
          tagline_i18n?: Json;
          short_intro_i18n?: Json;
          bio_i18n?: Json;
          location_i18n?: Json;
          email?: string | null;
          phone?: string | null;
          whatsapp_url?: string | null;
          instagram_url?: string | null;
          youtube_url?: string | null;
          vimeo_url?: string | null;
          tiktok_url?: string | null;
          hero_video_path?: string | null;
          hero_poster_path?: string | null;
          showreel_video_path?: string | null;
          showreel_poster_path?: string | null;
          availability_status?: string;
          default_currency?: string;
          seo_title_i18n?: Json;
          seo_description_i18n?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: { [_ in never]: never };

    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_project_public: { Args: { p_project_id: string }; Returns: boolean };
      is_service_public: { Args: { p_service_id: string }; Returns: boolean };
    };

    Enums: { [_ in never]: never };

    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Database[keyof Database];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof (DefaultSchema["Enums"] & DefaultSchema["CompositeTypes"])
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] &
        Database[DefaultSchemaEnumNameOrOptions["schema"]]["CompositeTypes"])
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof (DefaultSchema["Enums"] &
        DefaultSchema["CompositeTypes"])
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicSchemaTypeNameOrOptions extends
    | keyof (DefaultSchema["CompositeTypes"] & DefaultSchema["Enums"])
    | { schema: keyof Database },
  CompositeTypeName extends PublicSchemaTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[PublicSchemaTypeNameOrOptions["schema"]]["CompositeTypes"] &
        Database[PublicSchemaTypeNameOrOptions["schema"]]["Enums"])
    : never = never,
> = PublicSchemaTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicSchemaTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicSchemaTypeNameOrOptions extends keyof (DefaultSchema["CompositeTypes"] &
        DefaultSchema["Enums"])
    ? DefaultSchema["CompositeTypes"][PublicSchemaTypeNameOrOptions]
    : never;