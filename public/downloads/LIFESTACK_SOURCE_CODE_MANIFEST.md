# LifeStack Source Code Manifest
## Complete File Inventory for IP Protection

**Owner:** Pragmatic Analytics Solutions (Pty) Ltd  
**Date:** January 29, 2026

---

## FRONTEND APPLICATION

### Core Application Files

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/main.tsx` | Application entry point | ~30 |
| `src/App.tsx` | Root component with routing | ~100 |
| `src/App.css` | Global styles | ~50 |
| `src/index.css` | Tailwind and design tokens | ~200 |
| `src/vite-env.d.ts` | TypeScript declarations | ~10 |

### Page Components

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/pages/Home.tsx` | Main dashboard | ~400 |
| `src/pages/Journal.tsx` | Multi-modal journaling | ~750 |
| `src/pages/Mentor.tsx` | AI chat interface | ~220 |
| `src/pages/Community.tsx` | Social features | ~1200 |
| `src/pages/Goals.tsx` | Goal management | ~300 |
| `src/pages/Habits.tsx` | Habit tracking | ~250 |
| `src/pages/Calendar.tsx` | Calendar view | ~200 |
| `src/pages/LifeEvents.tsx` | Life events management | ~300 |
| `src/pages/Library.tsx` | Playbook library | ~100 |
| `src/pages/Onboarding.tsx` | Setup wizard | ~360 |
| `src/pages/NewGoal.tsx` | Goal creation form | ~200 |
| `src/pages/NewHabit.tsx` | Habit creation form | ~200 |
| `src/pages/Settings.tsx` | User preferences | ~300 |
| `src/pages/Admin.tsx` | Admin analytics | ~400 |
| `src/pages/Auth.tsx` | Authentication | ~150 |
| `src/pages/ResetPassword.tsx` | Password reset | ~100 |
| `src/pages/UpdatePassword.tsx` | Password update | ~100 |
| `src/pages/Pricing.tsx` | Subscription pricing | ~200 |
| `src/pages/Terms.tsx` | Terms & Conditions | ~360 |
| `src/pages/PrivacyPolicy.tsx` | Privacy policy | ~300 |
| `src/pages/Landing.tsx` | Marketing page | ~400 |
| `src/pages/Index.tsx` | Landing redirect | ~20 |
| `src/pages/NotFound.tsx` | 404 page | ~50 |

### Context Providers

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/contexts/AuthContext.tsx` | Authentication state | ~155 |
| `src/contexts/LanguageContext.tsx` | Internationalization | ~100 |
| `src/contexts/SubscriptionContext.tsx` | Subscription state | ~100 |

### Custom Hooks

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/hooks/useSessionTracking.ts` | Screen time analytics | ~80 |
| `src/hooks/useLocation.ts` | Geolocation services | ~100 |
| `src/hooks/use-mobile.tsx` | Mobile detection | ~30 |
| `src/hooks/use-toast.ts` | Toast notifications | ~50 |

### Layout Components

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/components/layout/AppLayout.tsx` | App shell | ~45 |
| `src/components/layout/Sidebar.tsx` | Desktop navigation | ~150 |
| `src/components/layout/BottomNav.tsx` | Mobile navigation | ~100 |

### Onboarding Components

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/components/onboarding/IntroVideo.tsx` | Intro video player | ~80 |
| `src/components/onboarding/TermsAcceptance.tsx` | Terms acceptance | ~100 |
| `src/components/onboarding/UserGuide.tsx` | Interactive guide | ~200 |

### Subscription Components

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/components/subscription/LockedFeature.tsx` | Feature gating | ~50 |
| `src/components/subscription/ProgressToPaywall.tsx` | Progress tracking | ~80 |
| `src/components/subscription/SubscriptionBadge.tsx` | Tier display | ~40 |
| `src/components/subscription/UpgradeModal.tsx` | Upgrade prompt | ~150 |

### UI Components (shadcn/ui)

| File Path | Purpose |
|-----------|---------|
| `src/components/ui/accordion.tsx` | Expandable sections |
| `src/components/ui/alert-dialog.tsx` | Confirmation dialogs |
| `src/components/ui/alert.tsx` | Alert banners |
| `src/components/ui/avatar.tsx` | User avatars |
| `src/components/ui/badge.tsx` | Status badges |
| `src/components/ui/button.tsx` | Button variants |
| `src/components/ui/card.tsx` | Card containers |
| `src/components/ui/checkbox.tsx` | Checkboxes |
| `src/components/ui/collapsible.tsx` | Collapsible panels |
| `src/components/ui/dialog.tsx` | Modal dialogs |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menus |
| `src/components/ui/input.tsx` | Text inputs |
| `src/components/ui/label.tsx` | Form labels |
| `src/components/ui/progress.tsx` | Progress bars |
| `src/components/ui/select.tsx` | Select dropdowns |
| `src/components/ui/slider.tsx` | Range sliders |
| `src/components/ui/switch.tsx` | Toggle switches |
| `src/components/ui/tabs.tsx` | Tab navigation |
| `src/components/ui/textarea.tsx` | Text areas |
| `src/components/ui/toast.tsx` | Toast notifications |
| `src/components/ui/tooltip.tsx` | Tooltips |
| *(40+ additional UI components)* | |

### Utility Files

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/lib/utils.ts` | Helper functions | ~30 |
| `src/lib/translations.ts` | i18n strings | ~200 |
| `src/lib/validation.ts` | Input validation | ~50 |

### Integration Files

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/integrations/supabase/client.ts` | Supabase client | ~20 |
| `src/integrations/supabase/types.ts` | Database types | ~1000 |

---

## BACKEND (EDGE FUNCTIONS)

### Supabase Edge Functions

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `supabase/functions/mentor-chat/index.ts` | AI Mentor chat | ~165 |
| `supabase/functions/analyze-journal-entry/index.ts` | Journal AI analysis | ~250 |
| `supabase/functions/analyze-post-content/index.ts` | Content moderation | ~200 |
| `supabase/functions/admin-analytics/index.ts` | Admin data aggregation | ~150 |

### Configuration

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `supabase/config.toml` | Function configuration | ~15 |

---

## CONFIGURATION FILES

| File Path | Purpose |
|-----------|---------|
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `tsconfig.app.json` | App TypeScript config |
| `tsconfig.node.json` | Node TypeScript config |
| `components.json` | shadcn/ui configuration |
| `postcss.config.js` | PostCSS configuration |
| `eslint.config.js` | ESLint configuration |
| `vitest.config.ts` | Vitest test configuration |

---

## PUBLIC ASSETS

| File Path | Purpose |
|-----------|---------|
| `public/favicon.ico` | Browser favicon |
| `public/favicon.png` | PNG favicon |
| `public/manifest.json` | PWA manifest |
| `public/robots.txt` | SEO robots file |
| `public/videos/intro.mp4` | Onboarding video |
| `public/icons/icon-*.png` | PWA icons (8 sizes) |
| `src/assets/lifestack-logo.png` | App logo |

---

## TOTAL ESTIMATES

| Category | Files | Approx. Lines of Code |
|----------|-------|----------------------|
| Pages | 23 | ~6,000 |
| Components | 55 | ~4,000 |
| Contexts | 3 | ~350 |
| Hooks | 4 | ~260 |
| Utilities | 3 | ~280 |
| Edge Functions | 4 | ~765 |
| Configuration | 10 | ~300 |
| **TOTAL** | **102+** | **~12,000** |

---

*This manifest is accurate as of January 29, 2026*
