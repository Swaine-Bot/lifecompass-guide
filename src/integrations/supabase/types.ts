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
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
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
          id: string
          location_permission: string | null
          notifications_goals: boolean | null
          notifications_nudges: boolean | null
          notifications_social: boolean | null
          privacy_policy_accepted: boolean | null
          privacy_policy_accepted_at: string | null
          profile_visibility:
            | Database["public"]["Enums"]["post_visibility"]
            | null
          show_activity_status: boolean | null
          show_ai_insights_to_friends: boolean | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_friend_requests?: boolean | null
          created_at?: string | null
          id?: string
          location_permission?: string | null
          notifications_goals?: boolean | null
          notifications_nudges?: boolean | null
          notifications_social?: boolean | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          profile_visibility?:
            | Database["public"]["Enums"]["post_visibility"]
            | null
          show_activity_status?: boolean | null
          show_ai_insights_to_friends?: boolean | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_friend_requests?: boolean | null
          created_at?: string | null
          id?: string
          location_permission?: string | null
          notifications_goals?: boolean | null
          notifications_nudges?: boolean | null
          notifications_social?: boolean | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          profile_visibility?:
            | Database["public"]["Enums"]["post_visibility"]
            | null
          show_activity_status?: boolean | null
          show_ai_insights_to_friends?: boolean | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          available_minutes_per_day: number | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          focus_areas: Json | null
          guide_completed: boolean | null
          id: string
          is_verified: boolean | null
          language: string | null
          last_latitude: number | null
          last_longitude: number | null
          life_phase: Database["public"]["Enums"]["life_phase"] | null
          location_updated_at: string | null
          micro_moves_count: number
          name: string | null
          onboarding_completed: boolean | null
          page_category: string | null
          province: string | null
          strictness_level: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          available_minutes_per_day?: number | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          focus_areas?: Json | null
          guide_completed?: boolean | null
          id?: string
          is_verified?: boolean | null
          language?: string | null
          last_latitude?: number | null
          last_longitude?: number | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          location_updated_at?: string | null
          micro_moves_count?: number
          name?: string | null
          onboarding_completed?: boolean | null
          page_category?: string | null
          province?: string | null
          strictness_level?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          available_minutes_per_day?: number | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          focus_areas?: Json | null
          guide_completed?: boolean | null
          id?: string
          is_verified?: boolean | null
          language?: string | null
          last_latitude?: number | null
          last_longitude?: number | null
          life_phase?: Database["public"]["Enums"]["life_phase"] | null
          location_updated_at?: string | null
          micro_moves_count?: number
          name?: string | null
          onboarding_completed?: boolean | null
          page_category?: string | null
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
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          effort_minutes: number | null
          goal_id: string | null
          id: string
          is_one_thing: boolean | null
          milestone_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          effort_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_one_thing?: boolean | null
          milestone_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          effort_minutes?: number | null
          goal_id?: string | null
          id?: string
          is_one_thing?: boolean | null
          milestone_id?: string | null
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
    }
    Views: {
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
      are_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
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
      life_phase:
        | "student_early_career"
        | "builder"
        | "family_home"
        | "explorer"
        | "legacy_impact"
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
      life_phase: [
        "student_early_career",
        "builder",
        "family_home",
        "explorer",
        "legacy_impact",
      ],
      post_type: ["regular", "goal", "micro_move"],
      post_visibility: ["public", "friends", "private"],
      reaction_type: ["like", "love", "celebrate", "support", "insightful"],
      subscription_tier: ["free", "pro", "founder"],
      task_status: ["backlog", "this_week", "today", "done"],
    },
  },
} as const
