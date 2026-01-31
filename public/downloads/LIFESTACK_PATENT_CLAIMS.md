# LifeStack Patent Claims Documentation
## For: Pragmatic Analytics Solutions (Pty) Ltd

**Prepared:** January 29, 2026  
**Last Updated:** January 31, 2026  
**Version:** 2.2  
**Jurisdiction:** South Africa (Primary) / PCT International

---

## INVENTION TITLE

**LIFE-PHASE ADAPTIVE PERSONAL MANAGEMENT SYSTEM WITH AI-POWERED MENTORSHIP, MULTI-MODAL CONTENT ANALYSIS, AND TEMPORAL SELF-MESSAGING**

---

## ABSTRACT

A computer-implemented system and method for personal life management that adapts to a user's life phase and provides integrated goal tracking, habit formation, journaling, and AI-powered mentorship. The system analyzes multi-modal content (text, images, video, audio) to provide personalized feedback, opportunity detection, and professional referrals while enforcing appropriate boundaries for non-professional AI guidance. The system includes temporal self-messaging features allowing users to schedule media messages for future playback with automated push notification reminders, social accountability features with AI-powered content moderation supporting both individual and organizational accounts, subscription-based access tiers, and administrative analytics for platform management.

---

## INDEPENDENT CLAIMS

### CLAIM 1: Life-Phase Adaptive Personal Management System

A computer-implemented system for personal life management, comprising:

a) a user interface configured to receive and display information across a plurality of personal management domains including goals, habits, journal entries, and social interactions;

b) a life-phase classification module configured to classify a user into one of a predetermined set of life phases based on user input, wherein the life phases comprise at least: early career development, career building, family establishment, life exploration, and legacy creation;

c) an adaptation engine configured to modify system behavior based on the classified life phase, wherein modifications include at least:
   - adjusted content recommendations;
   - modified AI mentor response parameters;
   - customized goal category weightings;
   - phase-appropriate vocabulary and examples;

d) a goal decomposition engine configured to:
   - receive high-level goal definitions from the user;
   - decompose goals into time-bounded milestones;
   - further decompose milestones into discrete tasks;
   - classify tasks as "micro-moves" having durations between 5 and 30 minutes;
   - identify a single priority task as "The One Thing" for each time period;

e) a persistent data store maintaining user goals, habits, journal entries, mood/energy patterns, and social connections;

f) an AI mentorship module connected to a large language model, configured to:
   - receive conversation messages from the user;
   - retrieve context including current goals, life phase, and focus areas;
   - generate responses adapted to the user's life phase;
   - detect topics requiring professional intervention;
   - provide appropriate disclaimers and referrals;

g) wherein the system operates as a unified platform integrating all personal management domains rather than disparate applications.

### CLAIM 2: Multi-Modal Journal Analysis Method

A computer-implemented method for analyzing journal content, comprising:

a) receiving a journal entry comprising one or more of:
   - text content;
   - one or more image files;
   - one or more video files;
   - one or more audio recordings;
   - mood indicators;
   - energy level indicators;

b) extracting analyzable content from each modality, including performing optical character recognition on images and speech-to-text conversion on audio;

c) transmitting the extracted content to a large language model with a structured prompt comprising:
   - content moderation instructions;
   - positive reinforcement guidelines;
   - the user's active goals;
   - the user's current mood and energy state;
   - opportunity detection parameters;

d) receiving from the language model a structured response comprising:
   - an approval/rejection determination;
   - an empathetic mentor comment;
   - a goal-connected nudge;
   - zero or more detected opportunities with search queries;

e) storing the analysis results with the journal entry;

f) presenting the analysis to the user in a collapsible interface component;

g) wherein detected opportunities include localized search queries for relevant professional services or commercial offerings.

### CLAIM 3: AI Mentor with Professional Boundary Enforcement

A computer-implemented system for AI-powered life mentorship, comprising:

a) a conversation interface for receiving user messages;

b) a context retrieval module configured to fetch:
   - the user's classified life phase;
   - the user's selected focus areas;
   - the user's active goals and their statuses;
   - previous messages in the conversation;

c) a prompt construction module configured to generate a system prompt that:
   - establishes a consistent mentor persona;
   - incorporates retrieved context;
   - includes explicit boundary rules for professional advice domains;
   - specifies escalation procedures for crisis situations;

d) an inference module configured to submit the constructed prompt and user message to a large language model and receive a generated response;

e) a professional domain detector configured to analyze user messages for topics including:
   - medical symptoms or health conditions;
   - mental health struggles or emotional crises;
   - financial decisions or legal matters;
   - thoughts of self-harm or harm to others;

f) a referral injection module configured to append appropriate professional referrals when professional domains are detected, including:
   - location-based search queries for relevant professionals;
   - crisis helpline information when applicable;

g) a response delivery module configured to present the AI response with appropriate disclaimers;

h) wherein the system provides supportive guidance while consistently deferring to human professionals for serious matters.

### CLAIM 4: Temporal Self-Messaging System (NEW)

A computer-implemented system for scheduling and delivering future self-messages, comprising:

a) a media capture interface configured to record or upload:
   - video recordings;
   - voice recordings;
   - combined with text, mood, and energy indicators;

b) a scheduling module configured to:
   - receive a future date and time from the user;
   - validate that the scheduled time is in the future;
   - store the scheduled playback timestamp with the journal entry;

c) a persistent media storage system configured to:
   - store uploaded media files with unique identifiers;
   - generate time-limited signed URLs for secure playback;
   - maintain media integrity over extended time periods;

d) an automated reminder system comprising:
   - a scheduled job executing at regular intervals (e.g., every 5 minutes);
   - a query engine to identify entries with due playback dates;
   - integration with a push notification delivery service;
   - a deduplication mechanism to prevent repeated notifications;

e) a dedicated playback interface configured to:
   - retrieve the scheduled entry by identifier;
   - generate fresh signed URLs for media access;
   - automatically play video or audio content;
   - display associated context (mood, energy, date, text);

f) wherein the system enables users to create and receive messages from their past selves at predetermined future moments, integrated within a broader life management platform.

---

## DEPENDENT CLAIMS

### Claims Dependent on Claim 1

**CLAIM 5:** The system of claim 1, wherein the goal decomposition engine further comprises an effort estimation module configured to assign estimated time durations to tasks based on historical user performance data.

**CLAIM 6:** The system of claim 1, wherein the adaptation engine modifies display layouts and navigation patterns based on the user's device type and life phase.

**CLAIM 7:** The system of claim 1, further comprising a social accountability module configured to:
- manage friend connections between users;
- support follow relationships for organizational accounts;
- share selected goals or achievements with connected friends or followers;
- moderate shared content using AI analysis before publication.

**CLAIM 8:** The system of claim 1, wherein the AI mentorship module maintains distinct conversation threads and retrieves relevant historical context when resuming conversations.

**CLAIM 9:** The system of claim 1, further comprising a habit tracking module configured to:
- record daily habit completions;
- calculate streak counts;
- correlate habit completion with mood and energy patterns;
- provide visual feedback through completion indicators.

**CLAIM 10:** The system of claim 1, wherein the system is implemented as a progressive web application capable of offline operation and installation on mobile devices.

**CLAIM 11:** The system of claim 1, further comprising a subscription tier module configured to:
- manage user access levels (free, pro, founder tiers);
- gate premium features based on subscription status;
- track usage patterns for paywall triggering;
- integrate with external payment providers.

**CLAIM 12:** The system of claim 1, further comprising an administrative dashboard module configured to:
- aggregate user analytics across the platform;
- display geographic distribution of users;
- track subscription conversions;
- monitor feature usage patterns;
- analyze session duration metrics.

**CLAIM 13:** The system of claim 1, further comprising a role-based access control system configured to:
- assign user roles (user, admin);
- restrict administrative functions to authorized roles;
- modify navigation elements based on user role;
- protect sensitive analytics endpoints.

**CLAIM 14:** The system of claim 1, further comprising a dual account type system configured to:
- support individual personal accounts;
- support organizational/page accounts with category classification;
- provide unified follow relationships across account types;
- enable page discovery and suggestion mechanisms.

### Claims Dependent on Claim 2

**CLAIM 15:** The method of claim 2, wherein the content moderation instructions cause the language model to reject content comprising:
- graphic violence;
- pornographic material;
- hate speech;
- content promoting self-harm.

**CLAIM 16:** The method of claim 2, wherein the goal-connected nudge comprises an actionable suggestion connecting the journal entry content to one of the user's active goals.

**CLAIM 17:** The method of claim 2, wherein detected opportunities are categorized into domains including:
- health and fitness services;
- educational courses;
- professional services;
- hobby-related products;
- relationship activities.

**CLAIM 18:** The method of claim 2, further comprising:
- generating a signed URL for each uploaded media file;
- storing media files in encrypted cloud storage;
- validating file types against an allowlist before acceptance.

### Claims Dependent on Claim 3

**CLAIM 19:** The system of claim 3, wherein the mentor persona is characterized as "calm, direct, and pragmatic" with responses that are "warm but actionable."

**CLAIM 20:** The system of claim 3, wherein crisis detection triggers immediate presentation of emergency contact information and crisis helpline numbers.

**CLAIM 21:** The system of claim 3, further comprising rate limiting to prevent abuse of the AI inference module.

**CLAIM 22:** The system of claim 3, wherein professional referrals include geographically localized search queries based on the user's stored location.

### Claims Dependent on Claim 4 (NEW)

**CLAIM 23:** The system of claim 4, wherein the scheduled job is implemented using database-level cron scheduling (pg_cron) with HTTP triggers to serverless functions.

**CLAIM 24:** The system of claim 4, wherein push notifications include:
- a title indicating the message source ("Message from Past You");
- a body describing the scheduled playback;
- a deep link directly to the playback interface;
- action buttons for immediate viewing or dismissal.

**CLAIM 25:** The system of claim 4, wherein the playback interface:
- displays the original recording date and context;
- shows the user's mood and energy state at recording time;
- provides autoplay functionality for immediate emotional impact;
- allows navigation back to the main journal interface.

---

## ADDITIONAL INVENTIVE CONCEPTS

### Concept A: Mood-Energy Correlation Analysis

A method for analyzing patterns between user-reported mood and energy levels and:
- habit completion rates;
- goal progress velocity;
- journaling frequency;
- social interaction levels;

to generate personalized insights and recommendations.

### Concept B: Micro-Moves Scheduling Algorithm

An algorithm for scheduling micro-moves (small tasks) based on:
- user's available time per day;
- task effort estimates;
- goal priority levels;
- historical completion patterns;
- current mood and energy levels;

to maximize completion probability and goal progress.

### Concept C: Playbook System

A content distribution system for life phase-specific guidance packages ("playbooks") comprising:
- curated goals and milestones;
- habit templates;
- journaling prompts;
- mentorship conversation starters;

that users can install to bootstrap their life management practice.

### Concept D: AI Community Content Moderation

A pre-publication content review system comprising:
- text analysis for policy violations;
- media content screening;
- feedback generation for content improvement;
- visibility-based access control (public, friends, private);

that maintains community standards while enabling social accountability.

### Concept E: Session Analytics System

A user engagement tracking system comprising:
- session start/end detection;
- duration calculation and storage;
- aggregated analytics for platform insights;
- privacy-preserving data collection;

that enables platform optimization without compromising user privacy.

### Concept F: Interactive AI Insights Discovery

A user engagement system for AI-generated content comprising:
- "Tap to reveal" interaction pattern on media posts;
- Visual overlay prompts encouraging user engagement;
- Per-user privacy controls for AI insight visibility to friends;
- Cached AI analysis for performance optimization;
- Collapsible inline feedback display;

that increases user engagement with AI-generated insights while respecting privacy preferences.

### Concept G: Web Push Notification System

A privacy-respecting notification delivery system comprising:
- Automatic VAPID key generation and management;
- Service Worker-based background notification handling;
- Granular notification category preferences (goals, social, nudges);
- Browser permission state management;
- Push subscription lifecycle management;

that enables timely user engagement without requiring native app installation.

### Concept H: Temporal Self-Messaging Framework (NEW)

A holistic framework for future self-communication comprising:
- Multi-modal message creation (video, voice, text);
- Flexible scheduling with date and time precision;
- Integration with mood/energy tracking for emotional context;
- Automated delivery via push notifications;
- Dedicated playback experience with autoplay;
- Connection to broader life management goals and habits;

that enables users to strengthen their relationship with their future selves through scheduled reflections and encouragements.

### Concept I: Dual Account Type Social System (NEW)

A unified social platform supporting:
- Individual personal accounts for life management;
- Organizational/Page accounts for brands and communities;
- Asymmetric follow relationships (follow without friending);
- Page category classification and discovery;
- Verification status indicators;
- Dismissible page suggestions in feed;

that enables both personal connections and organizational engagement within a single platform.

---

## DRAWINGS DESCRIPTION

**Figure 1:** System architecture diagram showing the relationship between frontend application, backend services, AI gateway, scheduled jobs, and data stores.

**Figure 2:** User interface mockup showing the main dashboard with "The One Thing" task, habit check-ins, and mood/energy selectors.

**Figure 3:** Flowchart depicting the goal decomposition process from goal creation through milestone and task generation.

**Figure 4:** Sequence diagram showing the AI mentor conversation flow including context retrieval and professional boundary detection.

**Figure 5:** Flowchart depicting the multi-modal journal analysis process including content moderation and opportunity detection.

**Figure 6:** Entity-relationship diagram showing the database schema for users, goals, habits, journal entries, and social connections.

**Figure 7:** User interface mockup showing the admin analytics dashboard with user growth charts and geographic distribution.

**Figure 8:** State diagram showing the subscription tier transitions and feature access levels.

**Figure 9:** Flowchart depicting the community post moderation workflow with AI analysis.

**Figure 10:** User interface mockup showing responsive navigation with sidebar (desktop) and bottom navigation (mobile) with admin role awareness.

**Figure 11 (NEW):** Sequence diagram showing the temporal self-messaging flow from recording through scheduled delivery and playback.

**Figure 12 (NEW):** User interface mockup showing the journal entry form with scheduling controls for future playback.

**Figure 13 (NEW):** User interface mockup showing the dedicated playback page with autoplay media and emotional context display.

**Figure 14 (NEW):** Flowchart depicting the automated reminder system including cron job execution, notification delivery, and deduplication.

---

## TECHNICAL FIELD

The present invention relates to personal information management systems, and more particularly to life management platforms that integrate goal tracking, habit formation, journaling, temporal self-messaging, and AI-powered mentorship with adaptive user experiences based on life phase classification.

---

## BACKGROUND

Prior art in personal management applications typically addresses isolated domains:
- Habit tracking applications (Habitica, Streaks, Loop)
- Goal setting applications (Strides, Goals on Track)
- Journaling applications (Day One, Journey)
- AI assistants (Replika, Character.AI)
- Time capsule applications (Future Me, Capsule)

These solutions require users to maintain multiple applications without integration, leading to:
- Fragmented data across platforms
- Inability to correlate habits with goal progress
- Generic AI responses without personal context
- No adaptation to the user's life circumstances
- Disconnected temporal messaging without life management context

The present invention addresses these deficiencies by providing a unified platform that integrates all personal management domains with AI-powered guidance adapted to the user's life phase, including novel temporal self-messaging capabilities with automated reminder delivery.

---

## DETAILED DESCRIPTION OF PREFERRED EMBODIMENTS

### System Architecture

The preferred embodiment comprises:

1. **Frontend Application**: A React-based progressive web application utilizing TypeScript for type safety, Tailwind CSS for styling, and shadcn/ui for component primitives. The application is built with Vite for optimal development experience and production performance.

2. **Backend Services**: Lovable Cloud (powered by Supabase) providing PostgreSQL database with Row Level Security, serverless edge functions written in Deno/TypeScript, secure file storage with signed URLs, and scheduled job execution via pg_cron.

3. **AI Integration**: Lovable AI Gateway connecting to Google Gemini models (gemini-2.5-flash, gemini-3-flash-preview, gemini-2.5-pro) for mentorship, journal analysis, and content moderation.

4. **State Management**: TanStack Query for server state with optimistic updates, React Context for global application state (authentication, subscription, language).

5. **Scheduled Job System**: PostgreSQL pg_cron extension for scheduling background tasks, pg_net extension for HTTP requests to edge functions, enabling automated reminder delivery for temporal self-messaging.

### Authentication System

The authentication system provides:
- Email/password authentication with automatic session management
- Password reset flow with secure email links
- Role-based access control with admin detection
- Session persistence across browser refreshes

### Subscription System

The subscription tier system implements:
- Three-tier model: Free, Pro, Founder
- Feature gating with graceful degradation
- Progress-based paywall triggering
- Gumroad integration for payment processing

### Navigation System

The responsive navigation system provides:
- Desktop: Full sidebar with all navigation options
- Mobile: Bottom navigation bar with condensed options
- Admin awareness: Automatically shows Admin link for authorized users
- Context-aware active states for current route

### Temporal Self-Messaging System (NEW)

The Message to Future Self system implements:
- Media recording interface with video and audio capture
- Date and time scheduling with calendar picker
- Storage of scheduled timestamp with journal entry
- Automated cron job checking for due entries every 5 minutes
- Push notification delivery with deep link to playback
- Dedicated playback page with autoplay and emotional context
- Deduplication to prevent repeated notifications

### Dual Account Type System (NEW)

The social platform supports:
- Individual accounts for personal life management
- Page/Organization accounts with category classification
- Unified follow system across account types
- Page discovery and suggestion mechanism
- Verification status for trusted accounts

---

*This document is prepared for patent application purposes and should be reviewed by a qualified patent attorney before filing.*

*Version 2.2 - January 31, 2026*
