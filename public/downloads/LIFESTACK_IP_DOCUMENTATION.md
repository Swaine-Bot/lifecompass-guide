# LifeStack Intellectual Property Documentation
## Compiled for: Pragmatic Analytics Solutions (Pty) Ltd

---

**Document Version:** 2.1  
**Compilation Date:** January 29, 2026  
**Last Updated:** January 29, 2026  
**Prepared For:** Patent Application & IP Protection (South Africa and International)

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
- Habit tracking with behavioral analytics
- Goal decomposition into actionable "micro-moves"
- Social accountability features with content moderation
- Life-phase adaptive user experience
- Subscription tier management with progressive paywall
- Admin analytics dashboard with role-based access
- IP documentation and patent protection portal

**Key Innovation:** A unified "Life Operating System" that adapts to the user's current life phase and provides personalized guidance through an AI mentor that understands the user's goals, habits, mood patterns, and social connections.

---

## LEGAL ENTITY & OWNERSHIP

**Rights Holder:** Pragmatic Analytics Solutions (Pty) Ltd  
**Jurisdiction:** Republic of South Africa  
**Governing Law:** South African Law (Johannesburg Courts)

**Content Ownership:** Per Terms & Conditions dated January 29, 2026:
> "By uploading, submitting, or posting any content to LifeStack, you hereby irrevocably transfer and assign all rights, title, and interest in such content to Pragmatic Analytics Solutions (Pty) Ltd."

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

5. **Mood & Energy Tracking** - Daily check-ins with:
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
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ PostgreSQL   │  │   Storage    │  │Edge Functions│       │
│  │   + RLS      │  │ (User Media) │  │   (Deno)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Lovable AI Gateway                      │       │
│  │  ┌─────────────┐  ┌─────────────┐                │       │
│  │  │ Mentor Chat │  │ Content Mod │                │       │
│  │  └─────────────┘  └─────────────┘                │       │
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
**Files:** `src/pages/Goals.tsx`, `src/pages/NewGoal.tsx`

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

### 5. Journal System
**File:** `src/pages/Journal.tsx`

- Multi-modal entry:
  - Text content
  - Gratitude section
  - Reflection section
  - Photo/Video uploads (max 5 files, 10MB each)
  - Voice recording
- Mood and energy capture
- AI-powered analysis (see AI section)
- Collapsible AI feedback display

### 6. AI Mentor Chat
**Files:** `src/pages/Mentor.tsx`, `supabase/functions/mentor-chat/index.ts`

- Conversational AI interface
- Context-aware responses based on:
  - User's life phase
  - Focus areas
  - Conversation history
- Professional disclaimer with referral links
- Location-based service recommendations
- Rate limiting and error handling

### 7. Community & Social Features
**File:** `src/pages/Community.tsx`

- Friend search and requests
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

### 8. Push Notification System
**Files:** `public/sw.js`, `supabase/functions/push-vapid-keys/index.ts`, `supabase/functions/send-push-notification/index.ts`

- Web Push API integration with auto-generated VAPID keys
- Service Worker for background notification handling
- Granular notification preferences (Goals, Social, Nudges)
- Privacy-respecting push subscription management

### 9. Life Events Calendar
**File:** `src/pages/LifeEvents.tsx`

- Event types: Birthday, Anniversary, Deadline, Milestone, Custom
- Recurring events
- Reminder scheduling

### 9. Library (Playbooks)
**File:** `src/pages/Library.tsx`

- Curated life playbooks by phase
- Installation tracking
- Category organization

### 10. Admin Analytics Dashboard
**Files:** `src/pages/Admin.tsx`, `supabase/functions/admin-analytics/index.ts`

- Role-based access (admin only)
- User growth metrics
- Geographic distribution
- Subscription analytics
- Feature usage trends
- Screen time tracking
- IP Documentation quick access link

### 11. Authentication System
**Files:** `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx`, `src/pages/UpdatePassword.tsx`

- Email/password authentication
- Password reset with email link
- Password update flow
- Session management
- Admin role detection

### 12. Subscription & Monetization
**Files:** `src/contexts/SubscriptionContext.tsx`, `src/components/subscription/*`

- Tiered subscription system (Free, Pro, Founder)
- Feature gating with LockedFeature component
- Progress-based paywall
- Upgrade modal prompts
- Subscription badge display
- Gumroad license key integration

### 13. IP Documentation Portal
**File:** `src/pages/IPDocumentation.tsx`

- Downloadable IP documentation package
- Patent claims documentation
- Source code manifest
- Secure access for authorized users

### 15. Settings & Preferences
**File:** `src/pages/Settings.tsx`

- Profile management with avatar upload
- Clickable avatar in home page header for quick settings access
- Privacy settings including AI insights visibility to friends
- Push notification preferences (master toggle + granular controls)
- Language selection
- Timezone configuration
- Account management

### 16. Responsive Navigation
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
  micro_moves_count INTEGER DEFAULT 0
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

-- Journal Entries
journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  content TEXT,
  gratitude TEXT,
  reflection TEXT,
  mood INTEGER,
  energy INTEGER,
  tags JSONB
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

-- Social: Posts
posts (
  id UUID PRIMARY KEY,
  user_id UUID,
  content TEXT,
  media_urls JSONB,
  visibility ENUM (public, friends, private)
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
```

### Database Views

```sql
-- Public Profile View (for social features)
profiles_public (
  id, user_id, name, avatar_url, life_phase, created_at, updated_at
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

### Data Protection
- TLS 1.3 encryption in transit (AES-256-GCM)
- AES-256 encryption at rest
- Secure file storage with signed URLs
- Input validation with Zod schemas

### Privacy Controls
- Granular privacy settings per user
- Terms and privacy policy acceptance tracking
- Location permission management
- Profile visibility controls

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
| Pages | 24 | ~6,500 |
| Components | 60+ | ~4,500 |
| Contexts | 3 | ~400 |
| Hooks | 4 | ~300 |
| Utilities | 3 | ~300 |
| Edge Functions | 4 | ~800 |
| Configuration | 12 | ~400 |
| **TOTAL** | **110+** | **~13,200** |

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

---

## PRIOR ART DIFFERENTIATION

| Prior Art | LifeStack Differentiation |
|-----------|---------------------------|
| **Habitica** (habit tracking) | LifeStack integrates habits with goals, AI mentorship, and life-phase adaptation |
| **Notion** (productivity) | LifeStack provides AI-guided personal mentorship with professional boundaries |
| **Day One** (journaling) | LifeStack offers AI analysis with opportunity detection and goal nudging |
| **Replika** (AI companion) | LifeStack enforces professional boundaries and integrates with productivity tools |
| **Strides** (goal tracking) | LifeStack decomposes goals into micro-moves with effort estimation |

**Key Differentiators:**
1. Life-phase adaptive experience
2. AI mentor with professional boundary enforcement
3. Unified platform vs fragmented apps
4. Micro-moves framework for goal achievement
5. Multi-modal journal analysis with opportunity detection
6. Social accountability with AI moderation

---

## CLAIMS FOR PATENT PROTECTION

See companion document: `LIFESTACK_PATENT_CLAIMS.md`

**Independent Claims:**
1. Life-Phase Adaptive Personal Management System
2. Multi-Modal Journal Analysis Method
3. AI Mentor with Professional Boundary Enforcement

**Dependent Claims:** 14 additional claims covering specific implementations

---

*Document prepared for Pragmatic Analytics Solutions (Pty) Ltd*
*Version 2.0 - January 29, 2026*
