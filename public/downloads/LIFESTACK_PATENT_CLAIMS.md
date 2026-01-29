# LifeStack Patent Claims Documentation
## For: Pragmatic Analytics Solutions (Pty) Ltd

**Prepared:** January 29, 2026  
**Jurisdiction:** South Africa (Primary) / PCT International

---

## INVENTION TITLE

**LIFE-PHASE ADAPTIVE PERSONAL MANAGEMENT SYSTEM WITH AI-POWERED MENTORSHIP AND MULTI-MODAL CONTENT ANALYSIS**

---

## ABSTRACT

A computer-implemented system and method for personal life management that adapts to a user's life phase and provides integrated goal tracking, habit formation, journaling, and AI-powered mentorship. The system analyzes multi-modal content (text, images, video, audio) to provide personalized feedback, opportunity detection, and professional referrals while enforcing appropriate boundaries for non-professional AI guidance.

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

---

## DEPENDENT CLAIMS

### Claims Dependent on Claim 1

**CLAIM 4:** The system of claim 1, wherein the goal decomposition engine further comprises an effort estimation module configured to assign estimated time durations to tasks based on historical user performance data.

**CLAIM 5:** The system of claim 1, wherein the adaptation engine modifies display layouts and navigation patterns based on the user's device type and life phase.

**CLAIM 6:** The system of claim 1, further comprising a social accountability module configured to:
- manage friend connections between users;
- share selected goals or achievements with connected friends;
- moderate shared content using AI analysis before publication.

**CLAIM 7:** The system of claim 1, wherein the AI mentorship module maintains distinct conversation threads and retrieves relevant historical context when resuming conversations.

**CLAIM 8:** The system of claim 1, further comprising a habit tracking module configured to:
- record daily habit completions;
- calculate streak counts;
- correlate habit completion with mood and energy patterns;
- provide visual feedback through completion indicators.

**CLAIM 9:** The system of claim 1, wherein the system is implemented as a progressive web application capable of offline operation and installation on mobile devices.

### Claims Dependent on Claim 2

**CLAIM 10:** The method of claim 2, wherein the content moderation instructions cause the language model to reject content comprising:
- graphic violence;
- pornographic material;
- hate speech;
- content promoting self-harm.

**CLAIM 11:** The method of claim 2, wherein the goal-connected nudge comprises an actionable suggestion connecting the journal entry content to one of the user's active goals.

**CLAIM 12:** The method of claim 2, wherein detected opportunities are categorized into domains including:
- health and fitness services;
- educational courses;
- professional services;
- hobby-related products;
- relationship activities.

**CLAIM 13:** The method of claim 2, further comprising:
- generating a signed URL for each uploaded media file;
- storing media files in encrypted cloud storage;
- validating file types against an allowlist before acceptance.

### Claims Dependent on Claim 3

**CLAIM 14:** The system of claim 3, wherein the mentor persona is characterized as "calm, direct, and pragmatic" with responses that are "warm but actionable."

**CLAIM 15:** The system of claim 3, wherein crisis detection triggers immediate presentation of emergency contact information and crisis helpline numbers.

**CLAIM 16:** The system of claim 3, further comprising rate limiting to prevent abuse of the AI inference module.

**CLAIM 17:** The system of claim 3, wherein professional referrals include geographically localized search queries based on the user's stored location.

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

---

## DRAWINGS DESCRIPTION

**Figure 1:** System architecture diagram showing the relationship between frontend application, backend services, AI gateway, and data stores.

**Figure 2:** User interface mockup showing the main dashboard with "The One Thing" task, habit check-ins, and mood/energy selectors.

**Figure 3:** Flowchart depicting the goal decomposition process from goal creation through milestone and task generation.

**Figure 4:** Sequence diagram showing the AI mentor conversation flow including context retrieval and professional boundary detection.

**Figure 5:** Flowchart depicting the multi-modal journal analysis process including content moderation and opportunity detection.

**Figure 6:** Entity-relationship diagram showing the database schema for users, goals, habits, journal entries, and social connections.

---

## TECHNICAL FIELD

The present invention relates to personal information management systems, and more particularly to life management platforms that integrate goal tracking, habit formation, journaling, and AI-powered mentorship with adaptive user experiences based on life phase classification.

---

## BACKGROUND

Prior art in personal management applications typically addresses isolated domains:
- Habit tracking applications (Habitica, Streaks, Loop)
- Goal setting applications (Strides, Goals on Track)
- Journaling applications (Day One, Journey)
- AI assistants (Replika, Character.AI)

These solutions require users to maintain multiple applications without integration, leading to:
- Fragmented data across platforms
- Inability to correlate habits with goal progress
- Generic AI responses without personal context
- No adaptation to the user's life circumstances

The present invention addresses these deficiencies by providing a unified platform that integrates all personal management domains with AI-powered guidance adapted to the user's life phase.

---

*This document is prepared for patent application purposes and should be reviewed by a qualified patent attorney before filing.*
