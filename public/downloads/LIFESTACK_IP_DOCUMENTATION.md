# LifeStack Intellectual Property Documentation
## Compiled for: Pragmatic Analytics Solutions (Pty) Ltd

---

**Document Version:** 4.0 (Final)  
**Compilation Date:** February 2, 2026  
**Last Updated:** February 27, 2026  
**Prepared For:** Patent Application & IP Protection (South Africa and International)  
**Status:** FINAL - Ready for Patent Filing

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Legal Entity & Ownership](#legal-entity--ownership)
3. [Application Concept & Core Innovation](#application-concept--core-innovation)
4. [Technical Architecture](#technical-architecture)
5. [Core Features & Functionality](#core-features--functionality)
6. [AI-Powered Systems (Novel Inventions)](#ai-powered-systems-novel-inventions)
7. [Database Schema & Data Model](#database-schema--data-model)
8. [Security Architecture](#security-architecture)
9. [User Interface Components](#user-interface-components)
10. [Source Code Summary](#source-code-summary)
11. [Development Timeline](#development-timeline)
12. [Prior Art Differentiation](#prior-art-differentiation)
13. [Claims for Patent Protection](#claims-for-patent-protection)

---

## EXECUTIVE SUMMARY

**LifeStack** is a comprehensive life management platform that combines:
- AI-powered mentorship with context-aware, goal-based guidance
- Multi-modal journaling (text, photo, video, voice) with AI content analysis
- **Message to Future Self** with scheduled playback and push notification reminders
- Habit tracking with behavioral analytics
- Goal decomposition into actionable "micro-moves"
- Social accountability features with content moderation
- Dual account types (Individual and Page/Organization) with unified follow system
- Life-phase adaptive user experience
- Subscription tier management with progressive paywall
- Admin analytics dashboard with role-based access
- IP documentation and patent protection portal
- **Multi-regulatory compliance framework (GDPR, POPIA, HIPAA)**
- **GDPR Article 20 data portability with full data export**
- **Granular consent management with regulatory article references**

**Key Innovation:** A unified "Life Operating System" that adapts to the user's current life phase and provides personalized guidance through an AI mentor that understands the user's goals, habits, mood patterns, and social connections—with unique temporal messaging features allowing users to send messages to their future selves. The platform implements a comprehensive multi-regulatory compliance framework spanning GDPR (EU), POPIA (South Africa), and HIPAA-aligned security practices, with built-in data portability, granular consent management, and user rights enforcement.

---

## LEGAL ENTITY & OWNERSHIP

**Rights Holder:** Pragmatic Analytics Solutions (Pty) Ltd  
**Jurisdiction:** Republic of South Africa  
**Governing Law:** South African Law (Johannesburg Courts)

**Content Ownership:** Per Terms & Conditions dated February 24, 2026:
> "You retain full ownership of all content you create and upload to LifeStack. By using the Service, you grant us a limited, non-exclusive, revocable, royalty-free license to use, store, display, and process your content solely for the purpose of providing and improving the Service."

**Regulatory Compliance:**
- **GDPR (EU):** Full compliance with General Data Protection Regulation including lawful basis under Article 6, data subject rights (Articles 15-22), Data Protection Officer appointment, and data portability (Article 20)
- **POPIA (South Africa):** Compliance with Protection of Personal Information Act including Information Officer designation, Section 11 consent requirements, and data subject participation rights (Section 23-25)
- **HIPAA (US):** HIPAA-aligned security practices including encryption at rest (AES-256) and in transit (TLS 1.3), access controls, audit logging, and data minimization for health-related data (mood, energy, wellness tracking)

---

## APPLICATION CONCEPT & CORE INNOVATION

### Problem Statement
Modern life requires managing multiple interconnected domains (health, career, relationships, finances, personal growth) across different life phases. Existing solutions are fragmented, requiring users to manage separate apps for habits, goals, journaling, and mentorship.

### Solution: The Life Operating System
LifeStack provides a unified platform that:

1. **Adapts to Life Phases** - Five distinct phases with tailored experiences:
   - Student / Early Career
   - Builder
   - Family & Home
   - Explorer
   - Legacy & Impact

2. **AI-Powered Mentorship** - A context-aware AI mentor that:
   - Understands the user's current goals and habits
   - Provides guidance based on life phase
   - Offers professional referrals when appropriate
   - Maintains conversation history for continuity

3. **Micro-Moves Framework** - Goal decomposition methodology:
   - Goals → Milestones → Tasks → "Micro-Moves" (5-15 min actions)
   - "The One Thing" daily priority highlighting
   - Effort-based scheduling

4. **Multi-Modal Journaling with AI Analysis** - Journal entries via:
   - Text input
   - Photo uploads
   - Video recording
   - Voice memos
   - AI-powered content moderation and opportunity detection

5. **Message to Future Self** - Temporal messaging system:
   - Schedule video or voice recordings for future playback
   - Date and time picker for precise scheduling
   - Push notification reminders when playback date arrives
   - Dedicated autoplay playback experience

6. **Mood & Energy Tracking** - Daily check-ins with:
   - 5-point mood scale with emoji visualization
   - 5-point energy scale with icon visualization
   - Correlation with habit completion and goal progress

---

## TECHNICAL ARCHITECTURE

### Technology Stack

```
Frontend:
├── React 18.3.1 (UI Framework)
├── TypeScript (Type Safety)
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── shadcn/ui (Component Library)
├── Framer Motion 12.29.2 (Animations)
├── React Router 6.30.1 (Navigation)
├── TanStack Query 5.83.0 (State Management)
├── Recharts 2.15.4 (Data Visualization)
├── React Hook Form 7.61.1 (Form Management)
├── Zod 3.25.76 (Validation)
├── Sonner 1.7.4 (Toast Notifications)
└── date-fns 3.6.0 (Date Utilities)

Backend:
├── Lovable Cloud (Backend-as-a-Service)
│   ├── PostgreSQL (Database)
│   ├── Row Level Security (Data Protection)
│   ├── Edge Functions (Serverless Logic)
│   ├── Storage (Media Files)
│   ├── pg_cron (Scheduled Jobs)
│   └── Authentication (User Management)
└── Lovable AI Gateway (AI Integration)

AI Models Used:
├── google/gemini-2.5-flash (Journal Analysis)
├── google/gemini-3-flash-preview (Mentor Chat)
└── google/gemini-2.5-pro (Content Moderation)
```

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DEVICE                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Progressive Web App               │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │
│  │  │  Home   │ │ Journal │ │ Mentor  │ │Community│   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │
│  │  │  Goals  │ │ Habits  │ │ Admin   │ │ IP Docs │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │           Journal Playback                   │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ PostgreSQL   │  │   Storage    │  │Edge Functions│       │
│  │   + RLS      │  │ (User Media) │  │   (Deno)     │       │
│  │   + pg_cron  │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Lovable AI Gateway                      │       │
│  │  ┌─────────────┐  ┌─────────────┐                │       │
│  │  │ Mentor Chat │  │ Content Mod │                │       │
│  │  └─────────────┘  └─────────────┘                │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │      Scheduled Jobs (pg_cron + pg_net)            │       │
│  │  ┌─────────────────────────────────────────┐     │       │
│  │  │ check-journal-reminders (every 5 mins)  │     │       │
│  │  └─────────────────────────────────────────┘     │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## CORE FEATURES & FUNCTIONALITY

### 1. Multi-Step Onboarding Wizard
**File:** `src/pages/Onboarding.tsx`

- Intro video presentation
- Name and timezone capture
- Life phase selection (5 phases)
- Focus area selection (up to 4 of 6 areas)
- Daily available time slider (15-180 minutes)
- Planning style preference (Flexible ↔ Structured)
- Interactive user guide
- Terms and privacy acceptance

### 2. Daily Dashboard ("Micro-Moves")
**File:** `src/pages/Home.tsx`

- Personalized greeting with date
- Stats row: Tasks Done, Habits Completed, Streak Count
- "The One Thing" - Priority task highlighting
- Today's Micro-Moves task list
- Habit check-in interface
- Mood & Energy quick capture
- Quick action buttons

### 3. Goal Management System
**Files:** `src/pages/Goals.tsx`, `src/pages/NewGoal.tsx`, `src/pages/GoalDetail.tsx`

- Goal creation with:
  - Title and description
  - Category (Health, Career, Money, Relationships, Mindset, Legacy)
  - Target date
  - Success metrics
  - Constraints/blockers
  - "Why" motivation capture
- Milestone breakdown
- Task decomposition
- Status tracking (Active, Completed, Paused, Archived)

### 4. Habit Tracking
**Files:** `src/pages/Habits.tsx`, `src/pages/NewHabit.tsx`

- Habit creation with customization
- Frequency options (Daily, Weekly, Custom)
- Color coding
- Metric tracking (optional)
- Visual completion interface
- Streak tracking

### 5. Journal System with Message to Future Self
**Files:** `src/pages/Journal.tsx`, `src/pages/JournalPlayback.tsx`

- Multi-modal entry:
  - Text content
  - Gratitude section
  - Reflection section
  - Photo/Video uploads (max 5 files, 10MB each)
  - Voice recording
- Mood and energy capture
- AI-powered analysis (see AI section)
- Collapsible AI feedback display
- **Message to Future Self feature:**
  - Schedule video or voice recordings for future playback
  - Date picker with calendar UI
  - Time selection for precise scheduling
  - Push notification reminders when date arrives
  - Dedicated playback page with autoplay
  - Click-through from notification to media playback
- Entry management (edit, delete)
- Recent entries display

### 6. Journal Playback Experience
**File:** `src/pages/JournalPlayback.tsx`

- Dedicated route: `/journal/playback/:entryId`
- Automatic media retrieval with fresh signed URLs
- Autoplay for video and audio content
- Fallback handling for entries without media
- Emotional context display (mood, energy, date)

### 7. AI Mentor Chat
**Files:** `src/pages/Mentor.tsx`, `supabase/functions/mentor-chat/index.ts`

- Conversational AI interface
- Context-aware responses based on:
  - User's life phase
  - Focus areas
  - Conversation history
- Professional disclaimer with referral links
- Location-based service recommendations
- Rate limiting and error handling

### 8. Community & Social Features
**File:** `src/pages/Community.tsx`

- Dual account types (Individual and Page/Organization)
- Unified follow system for both people and pages
- Friend search and requests (for Individual accounts)
- Post creation with media
- Visibility controls (Public, Friends, Private)
- Reactions (Like, Love, Celebrate, Support, Insightful)
- Comments
- AI content moderation
- Post deletion and editing
- Inline AI insights with "tap to reveal" interaction on media
- User avatar and name integration in feed posts
- AI mentor visibility privacy controls (per-user setting)
- Friends' posts visibility in unified social feed
- Page suggestion cards with follow/dismiss actions
- Profile dialog on avatar/name click

### 9. Push Notification System
**Files:** `public/sw.js`, `supabase/functions/push-vapid-keys/index.ts`, `supabase/functions/send-push-notification/index.ts`, `supabase/functions/check-journal-reminders/index.ts`

- Web Push API integration with auto-generated VAPID keys
- Service Worker for background notification handling
- Granular notification preferences (Goals, Social, Nudges)
- Privacy-respecting push subscription management
- **Scheduled journal playback reminders:**
  - Automated cron job runs every 5 minutes
  - Detects due journal entries with scheduled playback
  - Sends push notifications with direct link to playback
  - Marks entries as reminded to prevent duplicates

### 10. Life Events Calendar
**File:** `src/pages/LifeEvents.tsx`

- Event types: Birthday, Anniversary, Deadline, Milestone, Custom
- Recurring events
- Reminder scheduling

### 11. Library (Playbooks)
**File:** `src/pages/Library.tsx`

- Curated life playbooks by phase
- Installation tracking
- Category organization

### 12. Admin Analytics Dashboard
**Files:** `src/pages/Admin.tsx`, `supabase/functions/admin-analytics/index.ts`

- Role-based access (admin only)
- User growth metrics
- Geographic distribution
- Subscription analytics
- Feature usage trends
- Screen time tracking
- IP Documentation quick access link

### 13. Authentication System
**Files:** `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx`, `src/pages/UpdatePassword.tsx`

- Email/password authentication
- Password reset with email link
- Password update flow
- Session management
- Admin role detection

### 14. Subscription & Monetization
**Files:** `src/contexts/SubscriptionContext.tsx`, `src/components/subscription/*`

- Tiered subscription system (Free, Pro, Founder)
- Feature gating with LockedFeature component
- Progress-based paywall
- Upgrade modal prompts
- Subscription badge display
- Gumroad license key integration

### 15. IP Documentation Portal
**File:** `src/pages/IPDocumentation.tsx`

- Downloadable IP documentation package
- Patent claims documentation
- Source code manifest
- Secure access for authorized users

### 16. Settings & Preferences
**File:** `src/pages/Settings.tsx`

- Profile management with avatar upload
- Clickable avatar in home page header for quick settings access
- Privacy settings including AI insights visibility to friends
- Push notification preferences (master toggle + granular controls)
- Language selection
- Timezone configuration
- Account management
- **GDPR Article 20 data portability (full JSON export of all user data)**
- **Granular consent management with regulatory references**
- **Data subject rights summary panel**

### 18. Multi-Regulatory Compliance Framework (NEW)
**Files:** `src/pages/PrivacyPolicy.tsx`, `src/pages/Terms.tsx`, `src/pages/Settings.tsx`, `src/components/onboarding/TermsAcceptance.tsx`

- **Privacy Policy** aligned with GDPR, POPIA, and HIPAA:
  - Data Controller / Information Officer identification (GDPR Art. 13, POPIA §18)
  - Lawful basis for processing (GDPR Art. 6, POPIA §11)
  - Special category data handling for health/wellness data (GDPR Art. 9)
  - Data subject rights enumeration (GDPR Art. 15-22, POPIA §23-25)
  - Data retention policies and deletion procedures
  - Cross-border transfer safeguards
  - Cookie and tracking transparency
- **Terms & Conditions** with user-protective content licensing:
  - Users retain full content ownership (revocable license model)
  - 14-day notice period for account termination
  - Clear dispute resolution procedures
  - Age verification requirements (16+ / 18+ where required)
- **Data Export System** (GDPR Art. 20 compliance):
  - Aggregates data from all user tables (profiles, goals, habits, journal entries, mentor conversations, tasks, life events, daily check-ins, privacy settings, subscriptions)
  - Generates downloadable JSON blob with timestamp
  - Accessible via Settings → Privacy tab
- **Consent Management**:
  - Explicit consent language referencing GDPR Art. 6(1)(a) and POPIA §11
  - Separate checkboxes for Terms and Privacy Policy acceptance
  - Consent timestamps recorded in database
  - Granular notification consent toggles

### 17. Responsive Navigation
**Files:** `src/components/layout/Sidebar.tsx`, `src/components/layout/BottomNav.tsx`

- Desktop: Sidebar with full navigation
- Mobile: Bottom navigation bar
- Admin-aware navigation (shows Admin link for admin users)
- Context-aware active states

---

## AI-POWERED SYSTEMS (NOVEL INVENTIONS)

### AI Mentor System

**Edge Function:** `supabase/functions/mentor-chat/index.ts`

**Innovation:** A conversational AI mentor that:

1. **Contextual Awareness**
   - Receives user's life phase
   - Knows focus areas
   - Maintains conversation history
   - Understands current goals

2. **Professional Boundary Enforcement**
   - Clear disclaimers about non-professional advice
   - Automatic detection of medical/mental health topics
   - Links to professional services
   - Crisis intervention messaging

3. **Persona Consistency**
   - "Calm, direct, pragmatic" personality
   - Warm but actionable guidance
   - Draws from wisdom traditions and behavioral science

**System Prompt Architecture:**
```
You are a calm, direct, and pragmatic life mentor for the LifeStack app.
Your role is to help users navigate life decisions, build better habits, 
achieve goals, and find clarity.

[User's life phase context]
[Focus areas context]

CRITICAL DISCLAIMER - You must follow these rules strictly:
- Your guidance is for informational purposes only
- For medical symptoms → recommend doctors
- For mental health struggles → recommend therapists
- For financial decisions → recommend advisors
- For self-harm thoughts → provide crisis resources

Your tone: Like a wise friend who has seen a lot of life and genuinely 
wants to help - but one who knows their limits and always defers to 
professionals for serious matters.
```

### AI Journal Analysis System

**Edge Function:** `supabase/functions/analyze-journal-entry/index.ts`

**Innovation:** Multi-modal journal content analysis that:

1. **Content Moderation**
   - Detects harmful content (violence, hate speech, self-harm)
   - Flags inappropriate media
   - Prevents policy violations

2. **Positive Reinforcement**
   - Acknowledges user's emotional state
   - Provides personalized, empathetic feedback
   - Validates feelings and experiences

3. **Goal-Based Nudging**
   - Connects journal content to active goals
   - Suggests actionable next steps
   - Encouraging without being pushy

4. **Opportunity Detection**
   - Identifies mentioned interests/needs
   - Suggests relevant local services
   - Provides search queries for:
     - Gyms, coaches, nutrition
     - Courses, networking
     - Hobbies, classes
     - Relationship activities

**Analysis Output Schema:**
```json
{
  "approved": true,
  "mentorComment": "Empathetic, personalized comment",
  "nudge": "Goal-related encouragement",
  "opportunities": [
    {
      "category": "Category name",
      "title": "Short title",
      "description": "Why helpful",
      "searchQuery": "Google search query"
    }
  ],
  "flagReason": "Only if not approved"
}
```

### AI Community Post Moderation

**Edge Function:** `supabase/functions/analyze-post-content/index.ts`

**Innovation:** Pre-publication content review that:
- Analyzes text and media
- Provides feedback before posting
- Detects policy violations
- Suggests improvements

### Automated Journal Reminder System

**Edge Function:** `supabase/functions/check-journal-reminders/index.ts`

**Innovation:** Scheduled reminder system for Message to Future Self:
- Cron job executes every 5 minutes via pg_cron
- Queries for journal entries with due playback dates
- Triggers push notifications via send-push-notification function
- Includes deep link to playback page
- Marks entries as reminded to prevent duplicate notifications
- Handles edge cases (no subscription, expired entries)

---

## DATABASE SCHEMA & DATA MODEL

### Core Tables

```sql
-- User Profiles
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT,
  life_phase ENUM (student_early_career, builder, family_home, explorer, legacy_impact),
  available_minutes_per_day INTEGER,
  strictness_level INTEGER,
  focus_areas JSONB,
  onboarding_completed BOOLEAN,
  language TEXT,
  last_latitude NUMERIC,
  last_longitude NUMERIC,
  location_updated_at TIMESTAMP,
  country TEXT,
  province TEXT,
  guide_completed BOOLEAN,
  micro_moves_count INTEGER DEFAULT 0,
  account_type ENUM (individual, page),
  page_category TEXT,
  is_verified BOOLEAN,
  website_url TEXT
)

-- Goals
goals (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT,
  category TEXT,
  status ENUM (active, completed, paused, archived),
  target_date DATE,
  success_metric TEXT,
  constraints TEXT,
  why TEXT,
  priority INTEGER
)

-- Habits
habits (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT,
  description TEXT,
  frequency ENUM (daily, weekly, custom),
  color TEXT,
  target_value NUMERIC,
  metric_unit TEXT,
  reminder_times JSONB
)

-- Habit Logs
habit_logs (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits,
  date DATE,
  completed BOOLEAN,
  value NUMERIC
)

-- Journal Entries (with Message to Future Self)
journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  content TEXT,
  gratitude TEXT,
  reflection TEXT,
  mood INTEGER,
  energy INTEGER,
  tags JSONB,
  scheduled_playback_at TIMESTAMP,
  playback_reminder_sent BOOLEAN DEFAULT false
)

-- Daily Check-ins
daily_checkins (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  mood INTEGER,
  energy INTEGER,
  notes TEXT
)

-- Tasks (Micro-Moves)
tasks (
  id UUID PRIMARY KEY,
  user_id UUID,
  goal_id UUID REFERENCES goals,
  milestone_id UUID REFERENCES milestones,
  title TEXT,
  description TEXT,
  status ENUM (backlog, this_week, today, done),
  due_date DATE,
  effort_minutes INTEGER,
  is_one_thing BOOLEAN,
  tags JSONB
)

-- Milestones
milestones (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES goals,
  title TEXT,
  due_date DATE,
  status ENUM (backlog, this_week, today, done)
)

-- Mentor Conversations
mentor_conversations (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT
)

-- Mentor Messages
mentor_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES mentor_conversations,
  role TEXT,
  content TEXT
)

-- Social: Friendships
friendships (
  id UUID PRIMARY KEY,
  requester_id UUID,
  addressee_id UUID,
  status ENUM (pending, accepted, declined, blocked)
)

-- Social: Follows
follows (
  id UUID PRIMARY KEY,
  follower_id UUID,
  following_id UUID,
  created_at TIMESTAMP
)

-- Social: Posts
posts (
  id UUID PRIMARY KEY,
  user_id UUID,
  content TEXT,
  media_urls JSONB,
  visibility ENUM (public, friends, private),
  post_type ENUM (regular, goal, micro_move),
  goal_id UUID REFERENCES goals,
  habit_id UUID REFERENCES habits
)

-- Social: Comments
comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts,
  user_id UUID,
  content TEXT
)

-- Social: Reactions
reactions (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts,
  comment_id UUID REFERENCES comments,
  user_id UUID,
  reaction ENUM (like, love, celebrate, support, insightful)
)

-- Page Dismissals
page_dismissals (
  id UUID PRIMARY KEY,
  user_id UUID,
  dismissed_page_id UUID,
  created_at TIMESTAMP
)

-- Life Events
life_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT,
  description TEXT,
  event_date DATE,
  event_type ENUM (birthday, anniversary, deadline, milestone, custom),
  recurring BOOLEAN,
  reminder_days_before INTEGER[]
)

-- Library: Playbooks
library_playbooks (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  category TEXT,
  phase ENUM (life phases),
  content_json JSONB,
  cover_image TEXT,
  published BOOLEAN
)

-- Playbook Installations
playbook_installs (
  id UUID PRIMARY KEY,
  user_id UUID,
  playbook_id UUID REFERENCES library_playbooks
)

-- Privacy Settings
privacy_settings (
  id UUID PRIMARY KEY,
  user_id UUID,
  profile_visibility ENUM (public, friends, private),
  allow_friend_requests BOOLEAN,
  show_activity_status BOOLEAN,
  show_ai_insights_to_friends BOOLEAN,
  notifications_goals BOOLEAN,
  notifications_social BOOLEAN,
  notifications_nudges BOOLEAN,
  terms_accepted BOOLEAN,
  terms_accepted_at TIMESTAMP,
  privacy_policy_accepted BOOLEAN,
  privacy_policy_accepted_at TIMESTAMP,
  location_permission TEXT
)

-- User Roles
user_roles (
  id UUID PRIMARY KEY,
  user_id UUID,
  role ENUM (admin, user)
)

-- User Subscriptions
user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  tier ENUM (free, pro, founder),
  is_active BOOLEAN,
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  gumroad_license_key TEXT,
  gumroad_product_id TEXT
)

-- App Sessions (Analytics)
app_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER
)

-- Push Subscriptions
push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Database Views

```sql
-- Public Profile View (for social features)
profiles_public (
  id, user_id, name, avatar_url, bio, life_phase, account_type, 
  page_category, is_verified, website_url, created_at, updated_at
)

-- Searchable Profile View (for friend search)
profiles_searchable (
  user_id, name, avatar_url, bio, life_phase, account_type, 
  page_category, is_verified
)

-- Safe Subscription View (hides sensitive data)
user_subscriptions_safe (
  id, user_id, tier, is_active, started_at, expires_at
)
```

### Database Functions

```sql
-- Check if two users are friends
are_friends(user1_id UUID, user2_id UUID) RETURNS BOOLEAN

-- Check if user has a specific role
has_role(_role app_role, _user_id UUID) RETURNS BOOLEAN

-- Increment micro-moves counter
increment_micro_moves() RETURNS INTEGER

-- Check if user is following another
is_following(follower UUID, target UUID) RETURNS BOOLEAN
```

### Scheduled Jobs (pg_cron)

```sql
-- Journal playback reminder check (every 5 minutes)
SELECT cron.schedule(
  'check-journal-reminders',
  '*/5 * * * *',
  $$ SELECT net.http_post(...) $$
);
```

---

## SECURITY ARCHITECTURE

### Authentication
- Email/password authentication via Lovable Cloud Auth
- Secure password reset flow
- Session-based authentication
- JWT tokens with automatic refresh

### Row Level Security (RLS)
All tables protected with RLS policies:
- Users can only access their own data
- Social data respects visibility settings
- Admin roles have elevated access for analytics

### Data Protection (HIPAA-Aligned)
- TLS 1.3 encryption in transit (AES-256-GCM)
- AES-256 encryption at rest
- Secure file storage with signed URLs
- Input validation with Zod schemas
- Data minimization for health-related fields
- Access controls via Row Level Security

### Privacy Controls (GDPR/POPIA Compliant)
- Granular privacy settings per user
- Terms and privacy policy acceptance tracking with timestamps
- Explicit consent with regulatory article references (GDPR Art. 6(1)(a), POPIA §11)
- Location permission management
- Profile visibility controls
- AI insights visibility toggle
- **Full data portability export (GDPR Art. 20)**
- **Right to erasure support (GDPR Art. 17, POPIA §24)**
- **Data subject access request capability (GDPR Art. 15, POPIA §23)**

---

## USER INTERFACE COMPONENTS

### Layout Components
| Component | Purpose |
|-----------|---------|
| `AppLayout.tsx` | Main application shell with navigation |
| `Sidebar.tsx` | Desktop navigation with user info |
| `BottomNav.tsx` | Mobile bottom navigation with admin awareness |

### Onboarding Components
| Component | Purpose |
|-----------|---------|
| `IntroVideo.tsx` | Introductory video player |
| `TermsAcceptance.tsx` | Terms and privacy acceptance |
| `UserGuide.tsx` | Interactive feature tour |

### Subscription Components
| Component | Purpose |
|-----------|---------|
| `LockedFeature.tsx` | Feature gating wrapper |
| `ProgressToPaywall.tsx` | Usage-based paywall trigger |
| `SubscriptionBadge.tsx` | Tier indicator display |
| `UpgradeModal.tsx` | Upgrade prompt dialog |

### Community Components
| Component | Purpose |
|-----------|---------|
| `PageSuggestionCard.tsx` | Page follow/dismiss suggestion |
| `AccountTypeSelect.tsx` | Individual/Page account selector |
| `InviteFriends.tsx` | Friend invitation interface |
| `ShareGoalDialog.tsx` | Goal sharing modal |

### Mentor Components
| Component | Purpose |
|-----------|---------|
| `MentorMessage.tsx` | Chat message display |
| `MentorSidebar.tsx` | Conversation history |

### UI Component Library (40+ shadcn/ui components)
- Accordion, Alert, Avatar, Badge, Button
- Card, Checkbox, Collapsible, Command
- Dialog, Dropdown, Form, Input, Label
- Menu, Navigation, Popover, Progress
- Radio, Select, Separator, Sheet, Sidebar
- Skeleton, Slider, Switch, Table, Tabs
- Textarea, Toast, Toggle, Tooltip, etc.

---

## SOURCE CODE SUMMARY

| Category | Files | Approx. Lines |
|----------|-------|---------------|
| Pages | 26 | ~9,200 |
| Components | 70+ | ~5,500 |
| Contexts | 3 | ~400 |
| Hooks | 7 | ~520 |
| Utilities | 3 | ~300 |
| Edge Functions | 8 | ~1,200 |
| Configuration | 12 | ~400 |
| Service Workers | 1 | ~90 |
| **TOTAL** | **130+** | **~17,600** |

---

## DEVELOPMENT TIMELINE

| Date | Milestone |
|------|-----------|
| January 2026 | Initial concept and architecture |
| January 2026 | Core feature implementation |
| January 2026 | AI integration (Mentor, Journal Analysis) |
| January 2026 | Social features and community |
| January 2026 | Admin dashboard and analytics |
| January 2026 | Subscription system implementation |
| January 2026 | IP documentation compilation |
| January 29, 2026 | Version 2.0 documentation update |
| January 29, 2026 | Push notification system |
| January 29, 2026 | Page/Organization accounts with follow system |
| January 31, 2026 | Message to Future Self feature |
| January 31, 2026 | Journal Playback with automated reminders |
| January 31, 2026 | Version 2.2 documentation update |
| February 2, 2026 | Version 3.0 finalized for patent filing |
| February 24, 2026 | GDPR/POPIA/HIPAA compliance overhaul |
| February 24, 2026 | User content ownership model (revocable license) |
| February 24, 2026 | Data portability export system (GDPR Art. 20) |
| February 24, 2026 | Granular consent management with regulatory references |
| February 27, 2026 | Version 4.0 documentation update |

---

## PRIOR ART DIFFERENTIATION

| Prior Art | LifeStack Differentiation |
|-----------|---------------------------|
| **Habitica** (habit tracking) | LifeStack integrates habits with goals, AI mentorship, and life-phase adaptation |
| **Notion** (productivity) | LifeStack provides AI-guided personal mentorship with professional boundaries |
| **Day One** (journaling) | LifeStack offers AI analysis with opportunity detection and goal nudging |
| **Replika** (AI companion) | LifeStack enforces professional boundaries and integrates with productivity tools |
| **Strides** (goal tracking) | LifeStack decomposes goals into micro-moves with effort estimation |
| **Marco Polo** (video messaging) | LifeStack integrates temporal video messaging within a unified life OS with AI analysis |
| **Time Capsule apps** | LifeStack connects future messages to goals, mood tracking, and AI-powered insights |

**Key Differentiators:**
1. Life-phase adaptive experience
2. AI mentor with professional boundary enforcement
3. Unified platform vs fragmented apps
4. Micro-moves framework for goal achievement
5. Multi-modal journal analysis with opportunity detection
6. Social accountability with AI moderation
7. **Message to Future Self with automated reminders**
8. **Dual account types (Individual and Page/Organization)**
9. **Multi-regulatory compliance framework (GDPR, POPIA, HIPAA)**
10. **Built-in data portability with full user data export**
11. **Granular consent management with regulatory article references**

---

## CLAIMS FOR PATENT PROTECTION

See companion document: `LIFESTACK_PATENT_CLAIMS.md`

**Independent Claims:**
1. Life-Phase Adaptive Personal Management System
2. Multi-Modal Journal Analysis Method
3. AI Mentor with Professional Boundary Enforcement
4. Temporal Self-Messaging System with Automated Reminders
5. Multi-Regulatory Compliance and Data Portability System (NEW)

**Dependent Claims:** 22 additional claims covering specific implementations

---

*Document prepared for Pragmatic Analytics Solutions (Pty) Ltd*
*Version 4.0 - February 27, 2026*
