# LifeStack Intellectual Property Documentation
## Compiled for: Pragmatic Analytics Solutions (Pty) Ltd

---

**Document Version:** 1.0  
**Compilation Date:** January 29, 2026  
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
├── React 18 (UI Framework)
├── TypeScript (Type Safety)
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── shadcn/ui (Component Library)
├── Framer Motion (Animations)
├── React Router (Navigation)
├── TanStack Query (State Management)
└── Recharts (Data Visualization)

Backend:
├── Supabase (Backend-as-a-Service)
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
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                            │
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
- Post deletion

### 8. Life Events Calendar
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
**File:** `src/pages/Admin.tsx`

- Role-based access (admin only)
- User growth metrics
- Geographic distribution
- Subscription analytics
- Feature usage trends
- Screen time tracking

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
  event_date DATE,
  event_type ENUM (birthday, anniversary, deadline, milestone, custom),
  recurring BOOLEAN,
  reminder_days_before INTEGER[]
)

-- App Sessions (Screen Time)
app_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER
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

-- User Roles
user_roles (
  id UUID PRIMARY KEY,
  user_id UUID,
  role ENUM (admin, user)
)

-- Privacy Settings
privacy_settings (
  id UUID PRIMARY KEY,
  user_id UUID,
  profile_visibility ENUM (public, friends, private),
  allow_friend_requests BOOLEAN,
  show_activity_status BOOLEAN,
  location_permission TEXT,
  terms_accepted BOOLEAN,
  privacy_policy_accepted BOOLEAN
)

-- Library Playbooks
library_playbooks (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  phase ENUM (life phases),
  category TEXT,
  content_json JSONB,
  cover_image TEXT,
  published BOOLEAN
)

-- Playbook Installs
playbook_installs (
  id UUID PRIMARY KEY,
  user_id UUID,
  playbook_id UUID REFERENCES library_playbooks,
  installed_at TIMESTAMP
)
```

---

## SECURITY ARCHITECTURE

### Row Level Security (RLS)

All tables implement RLS policies ensuring users can only access their own data:

```sql
-- Example: profiles table
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### Secure Views

Public profile data exposed via secure view:
```sql
CREATE VIEW profiles_public WITH (security_invoker=on) AS
SELECT user_id, name, avatar_url, life_phase
FROM profiles;
-- Excludes: location, timezone, focus_areas, etc.
```

### File Upload Security

- MIME type validation
- File extension validation
- Size limits (10MB per file, 50MB total)
- Allowed types: images and videos only
- Private storage with signed URLs

### Encryption

- **Transit:** TLS 1.3 with AES-256-GCM
- **At Rest:** AES-256
- **Database:** Transparent Data Encryption (TDE)
- **Backups:** AES-256 encrypted

### Input Validation

Centralized validation using Zod:
```typescript
// src/lib/validation.ts
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_MESSAGES = 50;
```

---

## USER INTERFACE COMPONENTS

### Design System

**Color Palette (HSL):**
```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 47 100% 50%;          /* Gold accent */
  --primary-foreground: 240 10% 3.9%;
  --secondary: 240 3.7% 15.9%;
  --muted: 240 3.7% 15.9%;
  --accent: 240 3.7% 15.9%;
  --destructive: 0 84.2% 60.2%;
  --warning: 38 92% 50%;
}
```

### Custom Components

- Glass morphism cards
- Gold accent buttons
- Habit check circles
- Mood emoji selector
- Energy icon selector
- Chat bubbles (user/assistant)
- Collapsible feedback panels

---

## SOURCE CODE SUMMARY

### File Count by Type

| Category | Files | Description |
|----------|-------|-------------|
| Pages | 23 | Main application screens |
| Components | 50+ | Reusable UI components |
| Hooks | 4 | Custom React hooks |
| Contexts | 3 | State management contexts |
| Edge Functions | 4 | Backend serverless functions |
| Utilities | 3 | Helper functions |

### Key Files

```
src/
├── pages/
│   ├── Home.tsx           # Main dashboard
│   ├── Journal.tsx        # Journaling feature
│   ├── Mentor.tsx         # AI chat interface
│   ├── Community.tsx      # Social features
│   ├── Goals.tsx          # Goal management
│   ├── Habits.tsx         # Habit tracking
│   ├── Onboarding.tsx     # Setup wizard
│   ├── Admin.tsx          # Analytics dashboard
│   ├── Settings.tsx       # User preferences
│   └── Terms.tsx          # Legal terms
├── contexts/
│   ├── AuthContext.tsx    # Authentication state
│   ├── LanguageContext.tsx # i18n support
│   └── SubscriptionContext.tsx # Subscription state
├── hooks/
│   ├── useSessionTracking.ts # Screen time
│   └── useLocation.ts       # Geolocation
└── components/
    ├── layout/
    │   ├── AppLayout.tsx    # App shell
    │   ├── Sidebar.tsx      # Navigation
    │   └── BottomNav.tsx    # Mobile nav
    └── ui/                  # shadcn components

supabase/functions/
├── mentor-chat/           # AI mentor
├── analyze-journal-entry/ # Journal AI
├── analyze-post-content/  # Content moderation
└── admin-analytics/       # Admin data
```

---

## DEVELOPMENT TIMELINE

| Date | Milestone |
|------|-----------|
| Jan 2026 | Initial concept and architecture |
| Jan 2026 | Core authentication and profiles |
| Jan 2026 | Onboarding wizard implementation |
| Jan 2026 | Goal and habit tracking systems |
| Jan 2026 | AI Mentor integration |
| Jan 2026 | Journal with AI analysis |
| Jan 2026 | Community social features |
| Jan 2026 | Content moderation AI |
| Jan 2026 | Admin analytics dashboard |
| Jan 29, 2026 | Terms & Conditions finalized |
| Jan 29, 2026 | IP Documentation compiled |

---

## PRIOR ART DIFFERENTIATION

### Compared to Habit Trackers (Habitica, Streaks)
- LifeStack integrates habits with goals and life phases
- AI mentor provides context-aware guidance
- Social accountability features

### Compared to Goal Apps (Strides, Goals on Track)
- Micro-moves decomposition methodology
- "The One Thing" daily prioritization
- AI-powered goal coaching

### Compared to Journaling Apps (Day One, Journey)
- Multi-modal input (text, photo, video, voice)
- AI analysis with opportunity detection
- Integration with goal and habit systems

### Compared to AI Assistants (Replika, Character.AI)
- Life-phase adaptive responses
- Professional boundary enforcement
- Integration with user's actual goals/habits

### Unique Combination
No existing product combines:
1. Life-phase adaptive experience
2. Goal → Milestone → Micro-moves decomposition
3. AI mentor with professional guardrails
4. Multi-modal journaling with AI analysis
5. Social accountability with content moderation
6. All in a unified "Life Operating System"

---

## CLAIMS FOR PATENT PROTECTION

### Claim 1: Life-Phase Adaptive User Experience
A method and system for adapting a life management application's interface, recommendations, and AI responses based on the user's self-identified life phase.

### Claim 2: Micro-Moves Task Decomposition
A method for automatically decomposing user goals into milestones and "micro-moves" (5-15 minute actionable tasks) with effort-based scheduling.

### Claim 3: Context-Aware AI Mentorship
A system for providing AI-powered life guidance that incorporates user's goals, habits, mood patterns, life phase, and conversation history while enforcing professional boundaries.

### Claim 4: Multi-Modal Journal Analysis
A method for analyzing journal entries containing text, images, video, and audio to provide positive reinforcement, goal-based nudges, and opportunity detection.

### Claim 5: Goal-Connected Opportunity Detection
A system for identifying commercial opportunities mentioned in user content and providing localized search queries for relevant services.

### Claim 6: AI Content Moderation with Positive Feedback
A method for moderating user-generated content that provides constructive feedback and suggestions rather than simple rejection.

---

## APPENDICES

### Appendix A: Complete Database Schema
*See: `src/integrations/supabase/types.ts`*

### Appendix B: Edge Function Source Code
*See: `supabase/functions/` directory*

### Appendix C: Terms & Conditions
*See: `src/pages/Terms.tsx`*

### Appendix D: Privacy Policy
*See: `src/pages/PrivacyPolicy.tsx`*

---

**Document Prepared By:** LifeStack Development Team  
**For:** Pragmatic Analytics Solutions (Pty) Ltd  
**Date:** January 29, 2026  
**Version:** 1.0

---

*This document contains confidential and proprietary information. Unauthorized distribution is prohibited.*
