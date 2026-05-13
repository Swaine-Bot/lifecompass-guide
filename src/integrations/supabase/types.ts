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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_sessions: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cinematic_reports: {
        Row: {
          created_at: string | null
          id: string
          is_archived: boolean
          is_favorite: boolean
          is_read: boolean
          key_stats: Json | null
          lessons: Json | null
          major_wins: Json | null
          narrative: string | null
          period_end: string
          period_start: string
          report_type: string
          title: string
          turning_points: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          is_read?: boolean
          key_stats?: Json | null
          lessons?: Json | null
          major_wins?: Json | null
          narrative?: string | null
          period_end: string
          period_start: string
          report_type: string
          title: string
          turning_points?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          is_read?: boolean
          key_stats?: Json | null
          lessons?: Json | null
          major_wins?: Json | null
          narrative?: string | null
          period_end?: string
          period_start?: string
          report_type?: string
          title?: string
          turning_points?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          notes: string | null
          reason: string
          reporter_user_id: string
          reviewed_at: string | null
          reviewed_by_admin_id: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason: string
          reporter_user_id: string
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string
          reporter_user_id?: string
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      curated_offering_blocks: {
        Row: {
          access_model: string | null
          created_at: string | null
          description: string | null
          destination_type: string | null
          destination_url: string | null
          ends_at: string | null
          id: string
          is_public_shareable: boolean | null
          starts_at: string | null
          teaser: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          access_model?: string | null
          created_at?: string | null
          description?: string | null
          destination_type?: string | null
          destination_url?: string | null
          ends_at?: string | null
          id?: string
          is_public_shareable?: boolean | null
          starts_at?: string | null
          teaser: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          access_model?: string | null
          created_at?: string | null
          description?: string | null
          destination_type?: string | null
          destination_url?: string | null
          ends_at?: string | null
          id?: string
          is_public_shareable?: boolean | null
          starts_at?: string | null
          teaser?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string | null
          date: string | null
          energy: number | null
          id: string
          mood: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          energy?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          energy?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_signals: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean
          signal_date: string
          signal_type: string
          suggested_action: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          signal_date?: string
          signal_type: string
          suggested_action?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          signal_date?: string
          signal_type?: string
          suggested_action?: string | null
          user_id?: string
        }
        Relationships: []
      }
      engagement_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json
          source_engine: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json
          source_engine: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          source_engine?: string
          user_id?: string
        }
        Relationships: []
      }
      feed_post_ai_insights: {
        Row: {
          context_tag: string | null
          created_at: string | null
          id: string
          insight_text: string
          is_shareable: boolean | null
          post_id: string
          share_excerpt: string | null
        }
        Insert: {
          context_tag?: string | null
          created_at?: string | null
          id?: string
          insight_text: string
          is_shareable?: boolean | null
          post_id: string
          share_excerpt?: string | null
        }
        Update: {
          context_tag?: string | null
          created_at?: string | null
          id?: string
          insight_text?: string
          is_shareable?: boolean | null
          post_id?: string
          share_excerpt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_ai_insights_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_post_suggestion_links: {
        Row: {
          created_at: string | null
          id: string
          insight_id: string | null
          is_public_shareable: boolean | null
          label: string
          link_type: string | null
          post_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_id?: string | null
          is_public_shareable?: boolean | null
          label: string
          link_type?: string | null
          post_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_id?: string | null
          is_public_shareable?: boolean | null
          label?: string
          link_type?: string | null
          post_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_post_suggestion_links_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "feed_post_ai_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_post_suggestion_links_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_share_configs: {
        Row: {
          created_at: string | null
          created_by_user_id: string
          id: string
          included_insight_id: string | null
          included_link_ids: Json | null
          included_offering_id: string | null
          post_id: string
          share_mode: string
          visibility_mode: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id: string
          id?: string
          included_insight_id?: string | null
          included_link_ids?: Json | null
          included_offering_id?: string | null
          post_id: string
          share_mode?: string
          visibility_mode?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string
          id?: string
          included_insight_id?: string | null
          included_link_ids?: Json | null
          included_offering_id?: string | null
          post_id?: string
          share_mode?: string
          visibility_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_share_configs_included_insight_id_fkey"
            columns: ["included_insight_id"]
            isOneToOne: false
            referencedRelation: "feed_post_ai_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_share_configs_included_offering_id_fkey"
            columns: ["included_offering_id"]
            isOneToOne: false
            referencedRelation: "curated_offering_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_share_configs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string | null
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string | null
        }
        Insert: {
          addressee_id: string
          created_at?: string | null
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          constraints: string | null
          created_at: string | null
          id: string
          priority: number | null
          status: Database["public"]["Enums"]["goal_status"] | null
          success_metric: string | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
          why: string | null
        }
        Insert: {
          category?: string | null
          constraints?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          success_metric?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          why?: string | null
        }
        Update: {
          category?: string | null
          constraints?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          success_metric?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          habit_id: string
          id: string
          value: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date: string
          habit_id: string
          id?: string
          value?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          habit_id?: string
          id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          domain: Database["public"]["Enums"]["life_domain"]
          frequency: Database["public"]["Enums"]["habit_frequency"] | null
          id: string
          metric_unit: string | null
          reminder_times: Json | null
          target_value: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          domain?: Database["public"]["Enums"]["life_domain"]
          frequency?: Database["public"]["Enums"]["habit_frequency"] | null
          id?: string
          metric_unit?: string | null
          reminder_times?: Json | null
          target_value?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          domain?: Database["public"]["Enums"]["life_domain"]
          frequency?: Database["public"]["Enums"]["habit_frequency"] | null
          id?: string
          metric_unit?: string | null
          reminder_times?: Json | null
          target_value?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string | null
          date: string | null
          energy: number | null
          gratitude: string | null
          id: string
          mentor_feedback: Json | null
          mood: number | null
          playback_reminder_sent: boolean | null
          reflection: string | null
          scheduled_playback_at: string | null
          tags: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          date?: string | null
          energy?: number | null
          gratitude?: string | null
          id?: string
          mentor_feedback?: Json | null
          mood?: number | null
          playback_reminder_sent?: boolean | null
          reflection?: string | null
          scheduled_playback_at?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          date?: string | null
          energy?: number | null
          gratitude?: string | null
          id?: string
          mentor_feedback?: Json | null
          mood?: number | null
          playback_reminder_sent?: boolean | null
          reflection?: string | null
          scheduled_playback_at?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      library_playbooks: {
        Row: {
          category: string | null
          content_json: Json | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          phase: Database["public"]["Enums"]["life_phase"] | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content_json?: Json | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          phase?: Database["public"]["Enums"]["life_phase"] | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content_json?: Json | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          phase?: Database["public"]["Enums"]["life_phase"] | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      life_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          recurring: boolean | null
          reminder_days_before: number[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          recurring?: boolean | null
          reminder_days_before?: number[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          recurring?: boolean | null
          reminder_days_before?: number[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          image_metadata: Json | null
          image_url: string | null
          moderation_status: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          image_metadata?: Json | null
          image_url?: string | null
          moderation_status?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          image_metadata?: Json | null
          image_url?: string | null
          moderation_status?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "mentor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string | null
          due_date: string | null
          goal_id: string
          id: string
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          goal_id: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          goal_id?: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      mirror_moments: {
        Row: {
          category: string
          confidence_score: number
          content: string
          created_at: string | null
          id: string
          is_archived: boolean
          is_favorite: boolean
          is_read: boolean
          moment_date: string
          source_categories: Json | null
          user_id: string
        }
        Insert: {
          category: string
          confidence_score?: number
          content: string
          created_at?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          is_read?: boolean
          moment_date?: string
          source_categories?: Json | null
          user_id: string
        }
        Update: {
          category?: string
          confidence_score?: number
          content?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          is_read?: boolean
          moment_date?: string
          source_categories?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          id: string
          notes: string | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      momentum_streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          shield_available: boolean
          shield_used_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          shield_available?: boolean
          shield_used_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          shield_available?: boolean
          shield_used_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          cinematic_reports: boolean
          created_at: string | null
          drift_warnings: boolean
          frequency: string
          id: string
          milestone_alerts: boolean
          mirror_moments: boolean
          updated_at: string | null
          user_id: string
          weekly_recap: boolean
        }
        Insert: {
          cinematic_reports?: boolean
          created_at?: string | null
          drift_warnings?: boolean
          frequency?: string
          id?: string
          milestone_alerts?: boolean
          mirror_moments?: boolean
          updated_at?: string | null
          user_id: string
          weekly_recap?: boolean
        }
        Update: {
          cinematic_reports?: boolean
          created_at?: string | null
          drift_warnings?: boolean
          frequency?: string
          id?: string
          milestone_alerts?: boolean
          mirror_moments?: boolean
          updated_at?: string | null
          user_id?: string
          weekly_recap?: boolean
        }
        Relationships: []
      }
      page_dismissals: {
        Row: {
          created_at: string
          dismissed_page_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed_page_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed_page_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_assets: {
        Row: {
          approval_status: string
          archived_at: string | null
          asset_status: Database["public"]["Enums"]["partner_asset_status"]
          campaign_name: string | null
          created_at: string
          cta_label_override: string | null
          cta_url_override: string | null
          disclosure_override: string | null
          file_type: string | null
          file_url: string
          id: string
          is_latest_active: boolean
          notes: string | null
          partner_id: string
          placement_type: string
          replaced_by_asset_id: string | null
          replaced_campaign_name: string | null
          target_surfaces: Json | null
          title: string
          updated_at: string
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          approval_status?: string
          archived_at?: string | null
          asset_status?: Database["public"]["Enums"]["partner_asset_status"]
          campaign_name?: string | null
          created_at?: string
          cta_label_override?: string | null
          cta_url_override?: string | null
          disclosure_override?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          is_latest_active?: boolean
          notes?: string | null
          partner_id: string
          placement_type?: string
          replaced_by_asset_id?: string | null
          replaced_campaign_name?: string | null
          target_surfaces?: Json | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          version_number?: number
        }
        Update: {
          approval_status?: string
          archived_at?: string | null
          asset_status?: Database["public"]["Enums"]["partner_asset_status"]
          campaign_name?: string | null
          created_at?: string
          cta_label_override?: string | null
          cta_url_override?: string | null
          disclosure_override?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_latest_active?: boolean
          notes?: string | null
          partner_id?: string
          placement_type?: string
          replaced_by_asset_id?: string | null
          replaced_campaign_name?: string | null
          target_surfaces?: Json | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_assets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_assets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_assets_replaced_by_asset_id_fkey"
            columns: ["replaced_by_asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_assets_replaced_by_asset_id_fkey"
            columns: ["replaced_by_asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_click_events: {
        Row: {
          campaign_name: string | null
          clicked_at: string
          destination_url: string | null
          id: string
          partner_asset_id: string | null
          partner_id: string
          platform: string | null
          share_event_id: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_name?: string | null
          clicked_at?: string
          destination_url?: string | null
          id?: string
          partner_asset_id?: string | null
          partner_id: string
          platform?: string | null
          share_event_id?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_name?: string | null
          clicked_at?: string
          destination_url?: string | null
          id?: string
          partner_asset_id?: string | null
          partner_id?: string
          platform?: string | null
          share_event_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_click_events_partner_asset_id_fkey"
            columns: ["partner_asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_click_events_partner_asset_id_fkey"
            columns: ["partner_asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_click_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_click_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_click_events_share_event_id_fkey"
            columns: ["share_event_id"]
            isOneToOne: false
            referencedRelation: "partner_share_events"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_share_events: {
        Row: {
          campaign_name: string | null
          created_at: string
          destination_url: string | null
          id: string
          partner_asset_id: string | null
          partner_id: string
          platform: string | null
          share_card_type: string | null
          source_type: string | null
          tracking_token: string
          user_id: string
        }
        Insert: {
          campaign_name?: string | null
          created_at?: string
          destination_url?: string | null
          id?: string
          partner_asset_id?: string | null
          partner_id: string
          platform?: string | null
          share_card_type?: string | null
          source_type?: string | null
          tracking_token: string
          user_id: string
        }
        Update: {
          campaign_name?: string | null
          created_at?: string
          destination_url?: string | null
          id?: string
          partner_asset_id?: string | null
          partner_id?: string
          platform?: string | null
          share_card_type?: string | null
          source_type?: string | null
          tracking_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_share_events_partner_asset_id_fkey"
            columns: ["partner_asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_share_events_partner_asset_id_fkey"
            columns: ["partner_asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_share_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_share_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          billing_entity: string | null
          brand_color: string | null
          brand_description: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          country: string | null
          created_at: string
          default_cta_label: string | null
          default_cta_url: string | null
          disclosure_label: string
          id: string
          industry: string | null
          internal_notes: string | null
          logo_url: string | null
          name: string
          slug: string
          status: Database["public"]["Enums"]["partner_status"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          billing_entity?: string | null
          brand_color?: string | null
          brand_description?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          country?: string | null
          created_at?: string
          default_cta_label?: string | null
          default_cta_url?: string | null
          disclosure_label?: string
          id?: string
          industry?: string | null
          internal_notes?: string | null
          logo_url?: string | null
          name: string
          slug: string
          status?: Database["public"]["Enums"]["partner_status"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          billing_entity?: string | null
          brand_color?: string | null
          brand_description?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          country?: string | null
          created_at?: string
          default_cta_label?: string | null
          default_cta_url?: string | null
          disclosure_label?: string
          id?: string
          industry?: string | null
          internal_notes?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["partner_status"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      playbook_installs: {
        Row: {
          id: string
          installed_at: string | null
          playbook_id: string
          user_id: string
        }
        Insert: {
          id?: string
          installed_at?: string | null
          playbook_id: string
          user_id: string
        }
        Update: {
          id?: string
          installed_at?: string | null
          playbook_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_installs_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "library_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          created_at: string | null
          id: string
          source_conversation_id: string | null
          source_goal_id: string | null
          source_message_content: string | null
          source_type: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_conversation_id?: string | null
          source_goal_id?: string | null
          source_message_content?: string | null
          source_type?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          source_conversation_id?: string | null
          source_goal_id?: string | null
          source_message_content?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbooks_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "mentor_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbooks_source_goal_id_fkey"
            columns: ["source_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string | null
          goal_id: string | null
          habit_id: string | null
          id: string
          media_urls: Json | null
          post_type: Database["public"]["Enums"]["post_type"]
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          goal_id?: string | null
          habit_id?: string | null
          id?: string
          media_urls?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          content?: string | null
          created_at?: string | null
          goal_id?: string | null
          habit_id?: string | null
          id?: string
          media_urls?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_settings: {
        Row: {
          allow_friend_requests: boolean | null
          created_at: string | null
          curated_suggestions_enabled: boolean | null
          id: string
          location_permission: string | null
          notifications_goals: boolean | null
          notifications_nudges: boolean | null
          notifications_social: boolean | null
          privacy_policy_accepted: boolean | null
          privacy_policy_accepted_at: string | null
          privacy_policy_version: string | null
          profile_visibility:
            | Database["public"]["Enums"]["post_visibility"]
            | null
          show_activity_status: boolean | null
          show_ai_insights_to_friends: boolean | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_friend_requests?: boolean | null
          created_at?: string | null
          curated_suggestions_enabled?: boolean | null
          id?: string
          location_permission?: string | null
          notifications_goals?: boolean | null
          notifications_nudges?: boolean | null
          notifications_social?: boolean | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          privacy_policy_version?: string | null
          profile_visibility?:
            | Database["public"]["Enums"]["post_visibility"]
            | null
          show_activity_status?: boolean | null
          show_ai_insights_to_friends?: boolean | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_friend_requests?: boolean | null
          created_at?: string | null
          curated_suggestions_enabled?: boolean | null
          id?: string
          location_permission?: string | null
          notifications_goals?: boolean | null
          notifications_nudges?: boolean | null
          notifications_social?: boolean | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          privacy_policy_version?: string | null
          profile_visibility?:
            | Database["public"]["Enums"]["post_visibility"]
            | null
          show_activity_status?: boolean | null
          show_ai_insights_to_friends?: boolean | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          age_range: string | null
          available_minutes_per_day: number | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          focus_areas: Json | null
          gender: string | null
          guide_completed: boolean | null
          id: string
          identity_prompt: string | null
          is_verified: boolean | null
          language: string | null
          last_latitude: number | null
          last_longitude: number | null
          life_phase: Database["public"]["Enums"]["life_phase"] | null
          location_updated_at: string | null
          mentor_style: string | null
          micro_moves_count: number
          name: string | null
          occupation: string | null
          onboarding_completed: boolean | null
          page_category: string | null
          primary_intent: string | null
          province: string | null
          strictness_level: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          age_range?: string | null
          available_minutes_per_day?: number | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          focus_areas?: Json | null
          gender?: string | null
          guide_completed?: boolean | null
          id?: string
          identity_prompt?: string | null
          is_verified?: boolean | null
          language?: string | null
          last_latitude?: number | null
          last_longitude?: number | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          location_updated_at?: string | null
          mentor_style?: string | null
          micro_moves_count?: number
          name?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          page_category?: string | null
          primary_intent?: string | null
          province?: string | null
          strictness_level?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          age_range?: string | null
          available_minutes_per_day?: number | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          focus_areas?: Json | null
          gender?: string | null
          guide_completed?: boolean | null
          id?: string
          identity_prompt?: string | null
          is_verified?: boolean | null
          language?: string | null
          last_latitude?: number | null
          last_longitude?: number | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          location_updated_at?: string | null
          mentor_style?: string | null
          micro_moves_count?: number
          name?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          page_category?: string | null
          primary_intent?: string | null
          province?: string | null
          strictness_level?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          reaction: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_favorites: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_insights: {
        Row: {
          context_tag: string | null
          created_at: string | null
          id: string
          personal_note: string | null
          quote: string
          source_conversation_id: string | null
          user_id: string
        }
        Insert: {
          context_tag?: string | null
          created_at?: string | null
          id?: string
          personal_note?: string | null
          quote: string
          source_conversation_id?: string | null
          user_id: string
        }
        Update: {
          context_tag?: string | null
          created_at?: string | null
          id?: string
          personal_note?: string | null
          quote?: string
          source_conversation_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      share_cards: {
        Row: {
          card_type: string
          created_at: string | null
          id: string
          is_archived: boolean
          is_shared: boolean
          privacy_level: string
          signature_phrase: string | null
          source_id: string | null
          source_type: string | null
          stat_label: string | null
          stat_value: string | null
          subtitle: string | null
          theme: string
          title: string
          user_id: string
        }
        Insert: {
          card_type: string
          created_at?: string | null
          id?: string
          is_archived?: boolean
          is_shared?: boolean
          privacy_level?: string
          signature_phrase?: string | null
          source_id?: string | null
          source_type?: string | null
          stat_label?: string | null
          stat_value?: string | null
          subtitle?: string | null
          theme?: string
          title: string
          user_id: string
        }
        Update: {
          card_type?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean
          is_shared?: boolean
          privacy_level?: string
          signature_phrase?: string | null
          source_id?: string | null
          source_type?: string | null
          stat_label?: string | null
          stat_value?: string | null
          subtitle?: string | null
          theme?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      share_events: {
        Row: {
          card_type: string
          created_at: string | null
          format: string | null
          id: string
          privacy_level: string | null
          share_target: string | null
          user_id: string
        }
        Insert: {
          card_type: string
          created_at?: string | null
          format?: string | null
          id?: string
          privacy_level?: string | null
          share_target?: string | null
          user_id: string
        }
        Update: {
          card_type?: string
          created_at?: string | null
          format?: string | null
          id?: string
          privacy_level?: string | null
          share_target?: string | null
          user_id?: string
        }
        Relationships: []
      }
      share_link_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          platform_detected: string | null
          share_link_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          platform_detected?: string | null
          share_link_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          platform_detected?: string | null
          share_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_link_events_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          card_type: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_revoked: boolean
          landing_page_type: string
          share_card_id: string | null
          slug: string
          source_id: string | null
          source_type: string
          subtitle: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          visibility_mode: string
        }
        Insert: {
          card_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean
          landing_page_type?: string
          share_card_id?: string | null
          slug: string
          source_id?: string | null
          source_type: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          visibility_mode?: string
        }
        Update: {
          card_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean
          landing_page_type?: string
          share_card_id?: string | null
          slug?: string
          source_id?: string | null
          source_type?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          visibility_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_links_share_card_id_fkey"
            columns: ["share_card_id"]
            isOneToOne: false
            referencedRelation: "share_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          effort_minutes: number | null
          goal_id: string | null
          id: string
          is_one_thing: boolean | null
          milestone_id: string | null
          playbook_id: string | null
          priority: number
          sequence_order: number | null
          source_conversation_id: string | null
          source_type: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          effort_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_one_thing?: boolean | null
          milestone_id?: string | null
          playbook_id?: string | null
          priority?: number
          sequence_order?: number | null
          source_conversation_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          effort_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_one_thing?: boolean | null
          milestone_id?: string | null
          playbook_id?: string | null
          priority?: number
          sequence_order?: number | null
          source_conversation_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "mentor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          gumroad_license_key: string | null
          gumroad_product_id: string | null
          id: string
          is_active: boolean
          started_at: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          gumroad_license_key?: string | null
          gumroad_product_id?: string | null
          id?: string
          is_active?: boolean
          started_at?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          gumroad_license_key?: string | null
          gumroad_product_id?: string | null
          id?: string
          is_active?: boolean
          started_at?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          domain: Database["public"]["Enums"]["life_domain"]
          id: string
          level: number
          total_xp: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          domain: Database["public"]["Enums"]["life_domain"]
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          domain?: Database["public"]["Enums"]["life_domain"]
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wearable_connections: {
        Row: {
          access_token_encrypted: string | null
          connection_status: string
          created_at: string | null
          external_account_id: string | null
          id: string
          last_sync_at: string | null
          last_sync_status: string | null
          permissions_granted: Json | null
          provider: string
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connection_status?: string
          created_at?: string | null
          external_account_id?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          permissions_granted?: Json | null
          provider: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connection_status?: string
          created_at?: string | null
          external_account_id?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          permissions_granted?: Json | null
          provider?: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wearable_metrics: {
        Row: {
          created_at: string | null
          id: string
          local_date: string
          metric_type: string
          metric_value: number
          provider: string
          raw_provider_reference: Json | null
          source_timestamp: string
          sync_batch_id: string | null
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          local_date: string
          metric_type: string
          metric_value: number
          provider: string
          raw_provider_reference?: Json | null
          source_timestamp: string
          sync_batch_id?: string | null
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          local_date?: string
          metric_type?: string
          metric_value?: number
          provider?: string
          raw_provider_reference?: Json | null
          source_timestamp?: string
          sync_batch_id?: string | null
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wearable_notification_prefs: {
        Row: {
          created_at: string | null
          id: string
          inactivity_nudges: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          step_milestones: boolean | null
          step_reminders: boolean | null
          streak_alerts: boolean | null
          updated_at: string | null
          user_id: string
          weekly_summary: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inactivity_nudges?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          step_milestones?: boolean | null
          step_reminders?: boolean | null
          streak_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_summary?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inactivity_nudges?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          step_milestones?: boolean | null
          step_reminders?: boolean | null
          streak_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string | null
          domain: Database["public"]["Enums"]["life_domain"]
          id: string
          source_id: string | null
          source_type: string
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string | null
          domain: Database["public"]["Enums"]["life_domain"]
          id?: string
          source_id?: string | null
          source_type: string
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string | null
          domain?: Database["public"]["Enums"]["life_domain"]
          id?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      partner_assets_public: {
        Row: {
          cta_label_override: string | null
          cta_url_override: string | null
          disclosure_override: string | null
          file_type: string | null
          file_url: string | null
          id: string | null
          partner_id: string | null
          placement_type: string | null
          target_surfaces: Json | null
          title: string | null
        }
        Insert: {
          cta_label_override?: string | null
          cta_url_override?: string | null
          disclosure_override?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string | null
          partner_id?: string | null
          placement_type?: string | null
          target_surfaces?: Json | null
          title?: string | null
        }
        Update: {
          cta_label_override?: string | null
          cta_url_override?: string | null
          disclosure_override?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string | null
          partner_id?: string | null
          placement_type?: string | null
          target_surfaces?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_assets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_assets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partners_public: {
        Row: {
          brand_color: string | null
          brand_description: string | null
          default_cta_label: string | null
          default_cta_url: string | null
          disclosure_label: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          slug: string | null
          status: Database["public"]["Enums"]["partner_status"] | null
          website_url: string | null
        }
        Insert: {
          brand_color?: string | null
          brand_description?: string | null
          default_cta_label?: string | null
          default_cta_url?: string | null
          disclosure_label?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          website_url?: string | null
        }
        Update: {
          brand_color?: string | null
          brand_description?: string | null
          default_cta_label?: string | null
          default_cta_url?: string | null
          disclosure_label?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string | null
          is_verified: boolean | null
          life_phase: Database["public"]["Enums"]["life_phase"] | null
          name: string | null
          page_category: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          name?: string | null
          page_category?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          name?: string | null
          page_category?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles_searchable: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          bio: string | null
          is_verified: boolean | null
          life_phase: Database["public"]["Enums"]["life_phase"] | null
          name: string | null
          page_category: string | null
          user_id: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          is_verified?: boolean | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          name?: string | null
          page_category?: string | null
          user_id?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          is_verified?: boolean | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          name?: string | null
          page_category?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions_safe: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string | null
          is_active: boolean | null
          started_at: string | null
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_active?: boolean | null
          started_at?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_active?: boolean | null
          started_at?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_partner_asset: {
        Args: { _asset_id: string }
        Returns: undefined
      }
      are_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      award_xp: {
        Args: {
          _domain: Database["public"]["Enums"]["life_domain"]
          _source_id?: string
          _source_type: string
          _user_id: string
          _xp_amount: number
        }
        Returns: {
          leveled_up: boolean
          new_level: number
          new_total_xp: number
        }[]
      }
      get_active_partner_asset: {
        Args: { _partner_id: string; _placement?: string }
        Returns: {
          cta_label_override: string
          cta_url_override: string
          disclosure_override: string
          file_type: string
          file_url: string
          id: string
          partner_id: string
          placement_type: string
          target_surfaces: Json
          title: string
        }[]
      }
      get_active_partners: {
        Args: never
        Returns: {
          brand_color: string
          brand_description: string
          default_cta_label: string
          default_cta_url: string
          disclosure_label: string
          id: string
          logo_url: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["partner_status"]
          website_url: string
        }[]
      }
      get_profile_for_viewer: {
        Args: { target_user_id: string }
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string
          bio: string
          id: string
          is_verified: boolean
          life_phase: Database["public"]["Enums"]["life_phase"]
          name: string
          page_category: string
          user_id: string
          website_url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_micro_moves: { Args: never; Returns: number }
      is_following: {
        Args: { follower: string; target: string }
        Returns: boolean
      }
      record_daily_activity: {
        Args: { _local_date?: string }
        Returns: {
          changed: boolean
          current_streak: number
          last_activity_date: string
          longest_streak: number
          shield_available: boolean
          shield_used: boolean
        }[]
      }
      update_momentum_streak: {
        Args: { _user_id: string }
        Returns: {
          current_streak: number
          shield_used: boolean
        }[]
      }
    }
    Enums: {
      account_type: "individual" | "page"
      app_role: "admin" | "user"
      event_type:
        | "birthday"
        | "anniversary"
        | "deadline"
        | "milestone"
        | "custom"
      friendship_status: "pending" | "accepted" | "declined" | "blocked"
      goal_status: "active" | "completed" | "paused" | "archived"
      habit_frequency: "daily" | "weekly" | "custom"
      life_domain: "physical" | "mind" | "wealth" | "relationships" | "legacy"
      life_phase:
        | "student_early_career"
        | "builder"
        | "family_home"
        | "explorer"
        | "legacy_impact"
      partner_asset_status: "draft" | "approved" | "active" | "archived"
      partner_status: "active" | "inactive"
      post_type: "regular" | "goal" | "micro_move"
      post_visibility: "public" | "friends" | "private"
      reaction_type: "like" | "love" | "celebrate" | "support" | "insightful"
      subscription_tier: "free" | "pro" | "founder"
      task_status: "backlog" | "this_week" | "today" | "done"
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
  public: {
    Enums: {
      account_type: ["individual", "page"],
      app_role: ["admin", "user"],
      event_type: [
        "birthday",
        "anniversary",
        "deadline",
        "milestone",
        "custom",
      ],
      friendship_status: ["pending", "accepted", "declined", "blocked"],
      goal_status: ["active", "completed", "paused", "archived"],
      habit_frequency: ["daily", "weekly", "custom"],
      life_domain: ["physical", "mind", "wealth", "relationships", "legacy"],
      life_phase: [
        "student_early_career",
        "builder",
        "family_home",
        "explorer",
        "legacy_impact",
      ],
      partner_asset_status: ["draft", "approved", "active", "archived"],
      partner_status: ["active", "inactive"],
      post_type: ["regular", "goal", "micro_move"],
      post_visibility: ["public", "friends", "private"],
      reaction_type: ["like", "love", "celebrate", "support", "insightful"],
      subscription_tier: ["free", "pro", "founder"],
      task_status: ["backlog", "this_week", "today", "done"],
    },
  },
} as const
