# LifeStack Source Code Manifest
## Complete File Inventory for IP Protection

**Owner:** Pragmatic Analytics Solutions (Pty) Ltd  
**Date:** January 29, 2026  
**Version:** 2.0

---

## FRONTEND APPLICATION

### Core Application Files

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/main.tsx` | Application entry point | ~30 |
| `src/App.tsx` | Root component with routing | ~120 |
| `src/App.css` | Global styles | ~50 |
| `src/index.css` | Tailwind and design tokens | ~250 |
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
| `src/pages/Admin.tsx` | Admin analytics dashboard | ~450 |
| `src/pages/Auth.tsx` | Authentication | ~150 |
| `src/pages/ResetPassword.tsx` | Password reset request | ~150 |
| `src/pages/UpdatePassword.tsx` | Password update form | ~120 |
| `src/pages/Pricing.tsx` | Subscription pricing | ~200 |
| `src/pages/Terms.tsx` | Terms & Conditions | ~360 |
| `src/pages/PrivacyPolicy.tsx` | Privacy policy | ~300 |
| `src/pages/Landing.tsx` | Marketing page | ~400 |
| `src/pages/Index.tsx` | Landing redirect | ~20 |
| `src/pages/NotFound.tsx` | 404 page | ~50 |
| `src/pages/IPDocumentation.tsx` | IP docs download portal | ~200 |

### Context Providers

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/contexts/AuthContext.tsx` | Authentication state & admin detection | ~180 |
| `src/contexts/LanguageContext.tsx` | Internationalization | ~100 |
| `src/contexts/SubscriptionContext.tsx` | Subscription tier state | ~120 |

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
| `src/components/layout/AppLayout.tsx` | App shell | ~50 |
| `src/components/layout/Sidebar.tsx` | Desktop navigation | ~160 |
| `src/components/layout/BottomNav.tsx` | Mobile navigation with admin link | ~50 |

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
| `src/components/subscription/index.ts` | Barrel export | ~10 |

### Navigation Components

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/components/NavLink.tsx` | Navigation link component | ~30 |

### UI Components (shadcn/ui)

| File Path | Purpose |
|-----------|---------|
| `src/components/ui/accordion.tsx` | Expandable sections |
| `src/components/ui/alert-dialog.tsx` | Confirmation dialogs |
| `src/components/ui/alert.tsx` | Alert banners |
| `src/components/ui/aspect-ratio.tsx` | Aspect ratio container |
| `src/components/ui/avatar.tsx` | User avatars |
| `src/components/ui/badge.tsx` | Status badges |
| `src/components/ui/breadcrumb.tsx` | Breadcrumb navigation |
| `src/components/ui/button.tsx` | Button variants |
| `src/components/ui/calendar.tsx` | Date picker calendar |
| `src/components/ui/card.tsx` | Card containers |
| `src/components/ui/carousel.tsx` | Image carousel |
| `src/components/ui/chart.tsx` | Chart components |
| `src/components/ui/checkbox.tsx` | Checkboxes |
| `src/components/ui/collapsible.tsx` | Collapsible panels |
| `src/components/ui/command.tsx` | Command palette |
| `src/components/ui/context-menu.tsx` | Context menus |
| `src/components/ui/dialog.tsx` | Modal dialogs |
| `src/components/ui/drawer.tsx` | Bottom drawer |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menus |
| `src/components/ui/form.tsx` | Form components |
| `src/components/ui/hover-card.tsx` | Hover cards |
| `src/components/ui/input-otp.tsx` | OTP input |
| `src/components/ui/input.tsx` | Text inputs |
| `src/components/ui/label.tsx` | Form labels |
| `src/components/ui/menubar.tsx` | Menu bar |
| `src/components/ui/navigation-menu.tsx` | Navigation menu |
| `src/components/ui/pagination.tsx` | Pagination controls |
| `src/components/ui/popover.tsx` | Popovers |
| `src/components/ui/progress.tsx` | Progress bars |
| `src/components/ui/radio-group.tsx` | Radio buttons |
| `src/components/ui/resizable.tsx` | Resizable panels |
| `src/components/ui/scroll-area.tsx` | Scroll containers |
| `src/components/ui/select.tsx` | Select dropdowns |
| `src/components/ui/separator.tsx` | Separators |
| `src/components/ui/sheet.tsx` | Side sheets |
| `src/components/ui/sidebar.tsx` | Sidebar component |
| `src/components/ui/skeleton.tsx` | Loading skeletons |
| `src/components/ui/slider.tsx` | Range sliders |
| `src/components/ui/sonner.tsx` | Sonner toast provider |
| `src/components/ui/switch.tsx` | Toggle switches |
| `src/components/ui/table.tsx` | Data tables |
| `src/components/ui/tabs.tsx` | Tab navigation |
| `src/components/ui/textarea.tsx` | Text areas |
| `src/components/ui/toast.tsx` | Toast notifications |
| `src/components/ui/toaster.tsx` | Toast container |
| `src/components/ui/toggle-group.tsx` | Toggle groups |
| `src/components/ui/toggle.tsx` | Toggle buttons |
| `src/components/ui/tooltip.tsx` | Tooltips |
| `src/components/ui/use-toast.ts` | Toast hook |

### Utility Files

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/lib/utils.ts` | Helper functions (cn, etc.) | ~30 |
| `src/lib/translations.ts` | i18n strings | ~200 |
| `src/lib/validation.ts` | Zod validation schemas | ~50 |

### Integration Files

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/integrations/supabase/client.ts` | Lovable Cloud client | ~20 |
| `src/integrations/supabase/types.ts` | Database TypeScript types | ~1065 |

### Test Files

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `src/test/example.test.ts` | Example test | ~20 |
| `src/test/setup.ts` | Test setup | ~10 |

---

## BACKEND (EDGE FUNCTIONS)

### Lovable Cloud Edge Functions

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `supabase/functions/mentor-chat/index.ts` | AI Mentor conversation | ~165 |
| `supabase/functions/analyze-journal-entry/index.ts` | Journal AI analysis | ~250 |
| `supabase/functions/analyze-post-content/index.ts` | Community content moderation | ~200 |
| `supabase/functions/admin-analytics/index.ts` | Admin data aggregation | ~150 |

### Configuration

| File Path | Purpose | Lines |
|-----------|---------|-------|
| `supabase/config.toml` | Edge function configuration | ~15 |

---

## CONFIGURATION FILES

| File Path | Purpose |
|-----------|---------|
| `vite.config.ts` | Vite build configuration with PWA |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript base configuration |
| `tsconfig.app.json` | App TypeScript config |
| `tsconfig.node.json` | Node TypeScript config |
| `components.json` | shadcn/ui configuration |
| `postcss.config.js` | PostCSS configuration |
| `eslint.config.js` | ESLint configuration |
| `vitest.config.ts` | Vitest test configuration |
| `.env` | Environment variables (auto-generated) |

---

## PUBLIC ASSETS

| File Path | Purpose |
|-----------|---------|
| `public/favicon.ico` | Browser favicon |
| `public/favicon.png` | PNG favicon |
| `public/manifest.json` | PWA manifest |
| `public/robots.txt` | SEO robots file |
| `public/videos/intro.mp4` | Onboarding video |
| `public/icons/icon-72.png` | PWA icon 72x72 |
| `public/icons/icon-96.png` | PWA icon 96x96 |
| `public/icons/icon-128.png` | PWA icon 128x128 |
| `public/icons/icon-144.png` | PWA icon 144x144 |
| `public/icons/icon-152.png` | PWA icon 152x152 |
| `public/icons/icon-192.png` | PWA icon 192x192 |
| `public/icons/icon-384.png` | PWA icon 384x384 |
| `public/icons/icon-512.png` | PWA icon 512x512 |
| `src/assets/lifestack-logo.png` | App logo |

---

## IP DOCUMENTATION FILES

| File Path | Purpose |
|-----------|---------|
| `public/downloads/LIFESTACK_IP_DOCUMENTATION.md` | Main IP documentation |
| `public/downloads/LIFESTACK_PATENT_CLAIMS.md` | Patent claims |
| `public/downloads/LIFESTACK_SOURCE_CODE_MANIFEST.md` | This file |

---

## TOTAL ESTIMATES

| Category | Files | Approx. Lines of Code |
|----------|-------|----------------------|
| Pages | 24 | ~6,500 |
| Components | 60+ | ~4,500 |
| Contexts | 3 | ~400 |
| Hooks | 4 | ~260 |
| Utilities | 3 | ~280 |
| Edge Functions | 4 | ~765 |
| Configuration | 12 | ~350 |
| Tests | 2 | ~30 |
| **TOTAL** | **112+** | **~13,200** |

---

## TECHNOLOGY DEPENDENCIES

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI Framework |
| react-dom | ^18.3.1 | React DOM renderer |
| react-router-dom | ^6.30.1 | Client-side routing |
| @tanstack/react-query | ^5.83.0 | Data fetching & caching |
| @supabase/supabase-js | ^2.91.1 | Backend client |
| framer-motion | ^12.29.2 | Animations |
| tailwindcss-animate | ^1.0.7 | CSS animations |
| tailwind-merge | ^2.6.0 | Tailwind class merging |
| class-variance-authority | ^0.7.1 | Component variants |
| clsx | ^2.1.1 | Class name utility |
| zod | ^3.25.76 | Schema validation |
| react-hook-form | ^7.61.1 | Form management |
| @hookform/resolvers | ^3.10.0 | Form resolvers |
| date-fns | ^3.6.0 | Date utilities |
| recharts | ^2.15.4 | Charts |
| sonner | ^1.7.4 | Toast notifications |
| lucide-react | ^0.462.0 | Icons |
| cmdk | ^1.1.1 | Command menu |
| vaul | ^0.9.9 | Drawer component |
| embla-carousel-react | ^8.6.0 | Carousel |
| input-otp | ^1.4.2 | OTP input |
| react-day-picker | ^8.10.1 | Date picker |
| react-resizable-panels | ^2.1.9 | Resizable panels |
| next-themes | ^0.3.0 | Theme management |
| vite-plugin-pwa | ^1.2.0 | PWA support |
| @radix-ui/* | Various | UI primitives (20+ packages) |

---

*This manifest is accurate as of January 29, 2026 - Version 2.0*
