# File: /requirements_document_pwa.md
# Description: Comprehensive requirements document for Focus & Productivity Timer PWA
# Author: Libor Ballaty <libor@arionetworks.com>
# Created: 2025-09-30

# Focus & Productivity Timer PWA - Requirements Document

## 1. Executive Summary

The Focus & Productivity Timer is a Progressive Web App (PWA) designed to help users manage time, build productive habits, and maintain focus across work, study, exercise, and relaxation activities. Built with Next.js 14, TypeScript, and React, the app delivers a native-like mobile experience with offline-first capabilities, initially targeting iOS users with future Android expansion.

## 2. Project Scope

### 2.1 In Scope
- Progressive Web App installable on iOS Safari (14.5+)
- Offline-first architecture using service workers
- Responsive design optimized for mobile (iOS focus)
- Customizable timer profiles and sequences
- Local-first data storage (IndexedDB)
- Optional cloud sync via Supabase
- Analytics and progress tracking
- Custom notification sounds and haptic feedback
- Dark/light theme support
- Home screen installation prompts

### 2.2 Out of Scope (Initial Release)
- Native iOS/Android apps
- Calendar integration
- Social media sharing
- Wearable device integration
- Voice control features

### 2.3 Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: React Context + hooks or Zustand
- **Local Storage**: IndexedDB (via Dexie.js)
- **Backend**: Supabase (optional features)
- **PWA**: Next-PWA or custom service worker
- **Notifications**: Web Push API + Notification API
- **Audio**: Web Audio API

## 3. User Personas

### 3.1 Primary Personas

**Professional Worker (Sarah, 32)**
- Device: iPhone 13, uses Safari
- Needs: Deep focus sessions, break reminders, productivity tracking
- Goals: Increase work efficiency, manage meetings, reduce distractions
- Pain Points: Constant interruptions, poor time estimation, burnout
- PWA Expectation: Native-like experience, works offline during commute

**Student (Marcus, 21)**
- Device: iPhone SE, limited data plan
- Needs: Study sessions, exam preparation, habit building
- Goals: Improve grades, develop discipline, balance study/life
- Pain Points: Procrastination, social media distractions, inconsistent routines
- PWA Expectation: Lightweight app, minimal data usage, works offline in library

**Fitness Enthusiast (Lisa, 28)**
- Device: iPhone 14 Pro, uses during workouts
- Needs: Workout timers, interval training, recovery periods
- Goals: Maintain fitness routine, track progress, stay motivated
- Pain Points: Losing track of time, inconsistent workouts, lack of structure
- PWA Expectation: Quick access from home screen, audio cues during exercise

**Wellness Practitioner (David, 45)**
- Device: iPad Mini, iPhone 12
- Needs: Meditation sessions, breathing exercises, mindfulness practices
- Goals: Stress reduction, mental health, work-life balance
- Pain Points: Irregular practice, difficulty focusing, lack of guidance
- PWA Expectation: Calming interface, works offline anywhere, cross-device sync

## 4. User Stories & Use Cases

### 4.1 Core Timer Functionality

#### User Story 1: Basic Timer Usage
**As a** user
**I want to** start a simple timer for focused work
**So that** I can stay concentrated for a specific duration

**Use Case UC-001: Quick Timer Start**
- **Preconditions**: PWA is installed on iOS home screen
- **Main Flow**:
  1. User taps PWA icon on home screen
  2. App launches instantly (cached via service worker)
  3. User sees "Quick Focus" preset (25min) on main screen
  4. User taps "Start" button
  5. Timer begins countdown with circular progress indicator
  6. App sends push notification when complete (with permission)
  7. Haptic feedback on start/complete
- **Postconditions**: Session logged to IndexedDB, statistics updated
- **Acceptance Criteria**:
  - Launch time under 1 second from home screen
  - Timer accuracy within 1 second over 25 minutes
  - Works completely offline
  - Visual and audio notification at completion
  - Session automatically saved locally

#### User Story 2: Timer Control
**As a** user
**I want to** pause, resume, or stop my timer
**So that** I can handle interruptions without losing progress

**Use Case UC-002: Timer Control Operations**
- **Preconditions**: Timer is running in PWA
- **Main Flow**:
  1. User taps pause button
  2. Timer pauses, progress persists in IndexedDB
  3. App continues running in background (service worker)
  4. User can resume or stop completely
  5. If resumed, timer continues from exact pause point
  6. If stopped, session marked as incomplete with reason
- **Alternative Flow**: Screen locks - timer continues in background, wakes with notification
- **Acceptance Criteria**:
  - Pause/resume maintains exact millisecond accuracy
  - Timer survives app backgrounding
  - Timer survives screen lock
  - Stop action requires swipe confirmation (prevent accidents)
  - Session state persists through PWA reload

### 4.2 Profile Management

#### User Story 3: Custom Profiles
**As a** user
**I want to** create custom timer profiles for different activities
**So that** I can have optimized settings for work, study, exercise, etc.

**Use Case UC-003: Profile Creation**
- **Preconditions**: User is in profile management screen
- **Main Flow**:
  1. User taps "Create New Profile" floating action button
  2. Modal slides up from bottom (iOS-style)
  3. User enters profile name and optional description
  4. User sets timer duration (picker UI component)
  5. User sets break settings (optional)
  6. User selects notification sound from built-in library
  7. User chooses visual theme/color
  8. User configures focus mode (block notifications)
  9. User taps "Save Profile"
  10. Profile stored in IndexedDB
- **Postconditions**: Profile available in quick-select carousel
- **Acceptance Criteria**:
  - Profile saves all customization options locally
  - Profile appears in main timer selection immediately
  - Profile can be edited or deleted later
  - Profile works offline
  - Profile syncs to Supabase if user logged in (optional)

#### User Story 4: Timer Sequences
**As a** user
**I want to** create sequences of multiple timers
**So that** I can automate complex routines like workouts or study sessions

**Use Case UC-004: Sequence Creation**
- **Preconditions**: User has existing profiles or creates new ones
- **Main Flow**:
  1. User navigates to "Sequences" tab
  2. User taps "Create New Sequence"
  3. User adds timers to sequence via drag-and-drop interface
  4. User sets transition behavior (auto-advance/manual)
  5. User configures rest periods between timers
  6. User previews sequence flow (animated timeline)
  7. User saves sequence with name and emoji icon
- **Alternative Flow**: User can duplicate/modify existing sequences
- **Acceptance Criteria**:
  - Sequence runs timers in correct order
  - Pause/stop affects entire sequence
  - Progress indicator shows current position and total
  - Sequence survives app backgrounding
  - Notifications at each transition

### 4.3 Progressive Web App Features

#### User Story 5: PWA Installation
**As a** user
**I want to** install the app on my iOS home screen
**So that** I can access it like a native app

**Use Case UC-005: iOS Installation Flow**
- **Preconditions**: User accesses PWA via Safari
- **Main Flow**:
  1. User visits web app URL
  2. App detects first visit, shows custom install prompt
  3. Prompt explains: "Add to Home Screen for best experience"
  4. User taps prompt, sees iOS native share sheet instructions
  5. User follows: Share button → Add to Home Screen
  6. Icon appears on home screen with custom splash screen
  7. Subsequent launches open in standalone mode (no Safari UI)
- **Postconditions**: App behaves like native iOS app
- **Acceptance Criteria**:
  - Custom app icon (180x180) displays correctly
  - Splash screen shows during launch
  - Status bar color matches theme
  - No Safari address bar in standalone mode
  - App persists in iOS app switcher

#### User Story 6: Offline Functionality
**As a** user
**I want to** use all core features without internet
**So that** I can stay productive anywhere

**Use Case UC-006: Complete Offline Operation**
- **Preconditions**: User has previously loaded app (cached)
- **Main Flow**:
  1. User launches PWA without internet connection
  2. Service worker serves cached app shell
  3. All core timer functions work normally
  4. Profiles, sequences load from IndexedDB
  5. User completes sessions, data saves locally
  6. App queues sync operations for when online
  7. Visual indicator shows offline status (optional)
- **Postconditions**: No degraded functionality when offline
- **Acceptance Criteria**:
  - 100% of timer features work offline
  - Profile CRUD operations work offline
  - Analytics calculate from local data
  - No error messages about connectivity
  - Seamless sync when connectivity returns
  - Service worker caches all necessary assets

### 4.4 Data & Analytics

#### User Story 7: Progress Tracking
**As a** user
**I want to** view detailed statistics about my productivity
**So that** I can understand my patterns and improve over time

**Use Case UC-007: Analytics Dashboard**
- **Preconditions**: User has historical session data in IndexedDB
- **Main Flow**:
  1. User navigates to "Statistics" tab
  2. App queries IndexedDB for session history
  3. App displays daily/weekly/monthly summaries
  4. Interactive charts show trends (Chart.js or Recharts)
  5. User can filter by profile type or date range
  6. User can tap data points for detailed breakdown
  7. Statistics calculate in real-time from local data
- **Acceptance Criteria**:
  - Data visualization is responsive and touch-friendly
  - Charts render smoothly (60fps)
  - Export data as JSON for external analysis
  - Statistics calculate accurately
  - Works completely offline

#### User Story 8: Goal Setting
**As a** user
**I want to** set and track productivity goals
**So that** I can work toward specific objectives

**Use Case UC-008: Goal Management**
- **Preconditions**: User has baseline usage data
- **Main Flow**:
  1. User accesses "Goals" section
  2. User creates daily/weekly/monthly goals
  3. App tracks progress automatically from session data
  4. Progress bars show goal completion percentage
  5. Push notifications about goal progress (if enabled)
  6. Celebration animation when goals achieved
- **Acceptance Criteria**:
  - Goals are customizable and flexible
  - Progress updates in real-time
  - Achievement celebrations use haptic feedback
  - Goals sync across devices (if logged in)

### 4.5 Cloud Features (Optional)

#### User Story 9: Profile Sharing
**As a** user
**I want to** share my effective profiles with others
**So that** I can help others be more productive

**Use Case UC-009: Profile Export/Share**
- **Preconditions**: User has created custom profiles
- **Main Flow**:
  1. User selects profile to share
  2. User taps "Share" button
  3. App generates shareable URL with encoded profile data
  4. Native iOS share sheet appears
  5. Recipient opens URL in Safari
  6. PWA decodes profile, shows preview
  7. Recipient taps "Import" to add to their collection
- **Alternative Flow**: Generate QR code for in-person sharing
- **Acceptance Criteria**:
  - Sharing works without requiring accounts
  - Imported profiles maintain all settings
  - URLs are short and memorable
  - Works offline for QR codes

#### User Story 10: Cloud Sync
**As a** user
**I want to** sync my data across devices
**So that** I can access my profiles and history everywhere

**Use Case UC-010: Supabase Synchronization**
- **Preconditions**: User creates free account
- **Main Flow**:
  1. User signs up/logs in via Supabase Auth
  2. App uploads local profiles to Supabase
  3. App syncs session history to Supabase
  4. On second device, user logs in
  5. App downloads synced data
  6. Conflict resolution uses "most recent wins"
  7. Ongoing changes sync automatically when online
- **Acceptance Criteria**:
  - Sync is optional and clearly explained
  - Local data always remains accessible
  - Sync happens in background
  - User can export/delete all cloud data

### 4.6 Media & Customization

#### User Story 11: Custom Notification Sounds
**As a** user
**I want to** choose from various notification sounds
**So that** I can personalize my focus experience

**Use Case UC-011: Sound Selection**
- **Preconditions**: User is editing a profile
- **Main Flow**:
  1. User taps "Notification Sound" option
  2. Modal displays built-in sound library
  3. User can preview each sound
  4. Sounds use Web Audio API for precise timing
  5. User selects preferred sound
  6. Selection saves to profile in IndexedDB
- **Acceptance Criteria**:
  - 10+ built-in professional sounds
  - Sounds are lightweight (<50KB each)
  - Preview works instantly
  - Sounds cached for offline use
  - iOS respects silent mode appropriately

#### User Story 12: Visual Themes
**As a** user
**I want to** customize the app appearance
**So that** it matches my preferences and reduces eye strain

**Use Case UC-012: Theme Customization**
- **Preconditions**: User is in settings
- **Main Flow**:
  1. User accesses "Appearance" settings
  2. User selects: Light / Dark / Auto (system)
  3. User chooses accent color from palette
  4. Changes apply immediately (Tailwind CSS)
  5. Theme preference saves to localStorage
  6. Theme persists across sessions
- **Acceptance Criteria**:
  - Theme applies consistently across all screens
  - Dark mode is true black for OLED battery savings
  - Auto mode respects iOS system settings
  - Smooth transitions between themes
  - Accessibility contrast ratios maintained

### 4.7 Notifications & Background

#### User Story 13: Push Notifications
**As a** user
**I want to** receive notifications when timers complete
**So that** I stay on track even when app is backgrounded

**Use Case UC-013: Notification Management**
- **Preconditions**: User has granted notification permission
- **Main Flow**:
  1. User starts timer and backgrounds app
  2. Service worker tracks timer completion time
  3. At completion, service worker sends push notification
  4. Notification displays on lock screen/notification center
  5. User taps notification to return to app
  6. App shows session complete screen
- **Alternative Flow**: iOS focus mode - notifications queue and deliver when available
- **Acceptance Criteria**:
  - Notifications work when app is closed
  - Notification permission requested at appropriate time
  - User can customize notification content
  - Haptic feedback accompanies notifications
  - Notifications respect iOS Do Not Disturb

#### User Story 14: Background Timer Operation
**As a** user
**I want to** have timers run in the background
**So that** I can use other apps during focus sessions

**Use Case UC-014: Background Processing**
- **Preconditions**: Timer is running
- **Main Flow**:
  1. User starts timer
  2. User switches to another app or locks screen
  3. Service worker maintains timer state
  4. Timer continues counting down accurately
  5. User can return to app anytime
  6. App resumes with correct remaining time
- **Acceptance Criteria**:
  - Timer accuracy maintained in background
  - iOS doesn't kill service worker prematurely
  - Wake locks prevent sleep when appropriate
  - Minimal battery impact (<2% per hour)

## 5. Non-Functional Requirements

### 5.1 Performance Requirements (PWA-Specific)
- **NFR-001**: First load under 3 seconds on 4G connection
- **NFR-002**: Subsequent loads under 1 second (service worker cache)
- **NFR-003**: Lighthouse Performance score > 90
- **NFR-004**: Lighthouse PWA score = 100
- **NFR-005**: Interactive in under 2 seconds on mid-range devices
- **NFR-006**: Bundle size under 200KB (gzipped)
- **NFR-007**: Smooth 60fps animations and transitions
- **NFR-008**: Memory usage under 50MB during normal operation

### 5.2 iOS-Specific Requirements
- **NFR-009**: Works on Safari 14.5+ (iOS 14.5+)
- **NFR-010**: Proper viewport settings for iOS devices
- **NFR-011**: Handles iOS safe areas correctly (notch, home indicator)
- **NFR-012**: Respects iOS system preferences (dark mode, reduced motion)
- **NFR-013**: Proper haptic feedback using Vibration API
- **NFR-014**: Standalone mode behaves like native app
- **NFR-015**: App icon and splash screen meet iOS standards

### 5.3 Offline & PWA Requirements
- **NFR-016**: All core features work 100% offline
- **NFR-017**: Service worker caches all critical assets
- **NFR-018**: Background sync queues operations when offline
- **NFR-019**: Graceful degradation for optional cloud features
- **NFR-020**: Clear offline/online status indicators
- **NFR-021**: Data persists through browser cache clearing (IndexedDB)

### 5.4 Usability Requirements
- **NFR-022**: Intuitive interface requiring no tutorial
- **NFR-023**: Accessible design meeting WCAG 2.1 AA standards
- **NFR-024**: Touch-friendly (minimum 44x44pt tap targets)
- **NFR-025**: Support for iOS VoiceOver
- **NFR-026**: Responsive design (iPhone SE to iPad Pro)
- **NFR-027**: Gesture-based navigation (swipe, long-press)

### 5.5 Reliability Requirements
- **NFR-028**: 99.9% uptime for core offline functionality
- **NFR-029**: Data persistence survives app refresh
- **NFR-030**: Graceful handling of storage quota exceeded
- **NFR-031**: Automatic recovery from service worker failures

### 5.6 Security & Privacy Requirements
- **NFR-032**: All data encrypted in IndexedDB when possible
- **NFR-033**: HTTPS required for service worker registration
- **NFR-034**: No tracking or analytics without consent
- **NFR-035**: Supabase connection uses row-level security
- **NFR-036**: Content Security Policy properly configured
- **NFR-037**: No third-party scripts except essential services

## 6. Technical Architecture

### 6.1 Next.js App Structure
```
focus-timer-pwa/
├── app/                    # Next.js 14 App Router
│   ├── (main)/            # Main app routes
│   │   ├── page.tsx       # Home/Timer screen
│   │   ├── profiles/      # Profile management
│   │   ├── sequences/     # Sequence management
│   │   ├── analytics/     # Statistics
│   │   └── settings/      # App settings
│   ├── api/               # API routes (optional)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── timer/            # Timer-related components
│   ├── ui/               # Reusable UI components
│   └── layouts/          # Layout components
├── lib/                  # Utilities and helpers
│   ├── db/              # IndexedDB operations
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Helper functions
│   └── types/           # TypeScript types
├── public/              # Static assets
│   ├── icons/          # PWA icons
│   ├── sounds/         # Notification sounds
│   └── manifest.json   # PWA manifest
├── workers/            # Service worker
│   └── sw.ts          # Custom service worker
└── styles/            # Additional styles
```

### 6.2 Data Flow Architecture
```
User Interaction (React Component)
       ↓
State Management (Context/Zustand)
       ↓
Business Logic Layer
       ↓
   ┌───────┴────────┐
   ↓                ↓
IndexedDB      Supabase (optional)
(Primary)      (Sync only)
```

### 6.3 IndexedDB Schema
```typescript
interface FocusSession {
  sessionId: string;          // UUID
  profileId: string;          // Reference to profile
  startTimestamp: number;     // Unix timestamp
  plannedDurationMs: number;  // Milliseconds
  actualDurationMs: number;   // Actual completion time
  completionStatus: 'completed' | 'paused' | 'cancelled';
  interruptions: number;      // Count of pauses
  productivityRating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'failed';
}

interface TimerProfile {
  profileId: string;          // UUID
  displayName: string;
  description?: string;
  durationMs: number;         // Timer duration
  breakDurationMs?: number;   // Break after timer
  notificationSound: string;  // Sound file path
  colorTheme: string;         // Hex color
  focusModeEnabled: boolean;  // Block notifications
  hapticEnabled: boolean;
  icon: string;              // Emoji or icon name
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'failed';
}

interface TimerSequence {
  sequenceId: string;
  displayName: string;
  profileIds: string[];       // Ordered list of profiles
  autoAdvance: boolean;
  restBetweenMs?: number;
  createdAt: number;
  updatedAt: number;
}
```

### 6.4 Service Worker Strategy
- **App Shell**: Cache-first for HTML, CSS, JS
- **API Data**: Network-first with cache fallback
- **Images/Assets**: Cache-first
- **Sounds**: Cache-first (preload all)
- **Background Sync**: Queue operations when offline

### 6.5 State Management Options

**Option 1: React Context + useReducer**
- Pros: No dependencies, simple, sufficient for this app size
- Cons: Can cause re-renders if not optimized

**Option 2: Zustand**
- Pros: Lightweight (1KB), simple API, good TypeScript support
- Cons: Another dependency

**Recommendation**: Start with React Context, migrate to Zustand if performance issues arise

## 7. iOS-Specific Considerations

### 7.1 Installation Experience
- Custom install prompt with clear instructions
- Proper `apple-mobile-web-app-capable` meta tag
- `apple-mobile-web-app-status-bar-style` for status bar
- Multiple icon sizes for different iOS devices
- Launch screen with proper dimensions

### 7.2 iOS Limitations to Address
- **Service Worker Limits**: iOS may kill service workers after ~30 seconds inactive
  - Solution: Use Web Locks API to keep timer running
  - Fallback: Store timer state frequently to IndexedDB
- **Push Notifications**: Limited compared to native
  - Solution: Focus on in-app notifications and audio alerts
  - Use Notification API for foreground notifications
- **Background Audio**: Not available for web apps
  - Solution: Use silent local notifications with custom UI
- **Storage Limits**: IndexedDB may have 50MB limit
  - Solution: Implement data cleanup strategy
  - Prompt user to clear old data if approaching limit

### 7.3 iOS Safari Quirks
- Viewport height issues with toolbar appearance
  - Solution: Use `100dvh` (dynamic viewport height)
- Input focus causes zoom if font-size < 16px
  - Solution: Use minimum 16px font size for inputs
- Date pickers render differently
  - Solution: Build custom date picker component
- Touch event handling
  - Solution: Use pointer events instead of touch events

## 8. Success Criteria

### 8.1 Technical Success Metrics
- Lighthouse PWA score: 100
- Lighthouse Performance score: >90
- Lighthouse Accessibility score: >95
- First Contentful Paint: <1.5s
- Time to Interactive: <2.5s
- Service Worker cache hit rate: >95%
- Offline functionality: 100% core features

### 8.2 User Adoption Metrics
- 5,000+ PWA installations in first 3 months
- 70%+ installation rate from visitors
- 80%+ user retention after 30 days
- 60%+ daily active users
- Average 5+ sessions per day per active user

### 8.3 Functionality Metrics
- 95%+ of users successfully complete first timer
- 85%+ of users create custom profiles
- 70%+ of users create sequences
- <1% error rate across all features
- 99%+ timer accuracy

### 8.4 Performance Metrics
- Average load time: <1s (cached)
- Average memory usage: <40MB
- Average battery usage: <3% per hour
- Service worker activation success rate: >99%

## 9. Development Phases

### 9.1 Phase 1: MVP (Weeks 1-4)
- Basic timer functionality (start, pause, stop)
- Simple profile creation (name, duration)
- Local storage (IndexedDB)
- Basic PWA setup (manifest, service worker)
- iOS installation flow
- Simple analytics (session count, total time)

### 9.2 Phase 2: Enhanced Features (Weeks 5-8)
- Timer sequences
- Advanced profile customization
- Notification sounds (5+ options)
- Haptic feedback
- Dark mode
- Enhanced analytics with charts
- Goal setting

### 9.3 Phase 3: Cloud Features (Weeks 9-12)
- Supabase integration
- User authentication (optional)
- Profile sharing
- Cloud sync
- Community profile repository

### 9.4 Phase 4: Polish & Optimization (Weeks 13-16)
- Performance optimization
- Advanced offline capabilities
- Custom themes
- Advanced animations
- Beta testing and bug fixes
- App store submission preparation (if going hybrid)

## 10. Testing Strategy

### 10.1 Unit Testing
- React component testing (React Testing Library)
- Business logic testing (Jest)
- IndexedDB operations testing
- Service worker testing

### 10.2 Integration Testing
- Timer accuracy testing
- Offline/online transitions
- Background operation testing
- Notification delivery testing

### 10.3 Device Testing
- iPhone SE (smallest screen)
- iPhone 14 Pro (notch handling)
- iPhone 14 Pro Max (largest screen)
- iPad Mini (tablet experience)
- Various iOS versions (14.5, 15, 16, 17)

### 10.4 Performance Testing
- Lighthouse audits
- WebPageTest analysis
- Long-running timer tests (battery impact)
- Memory leak detection
- Service worker reliability testing

## 11. Future Enhancements

### 11.1 Phase 5 (Post-Launch)
- Advanced AI coaching (local TensorFlow.js models)
- Pomodoro technique variants
- Team/family sharing features
- Calendar integration
- Export to productivity tools

### 11.2 Phase 6 (Long-term)
- Android-specific optimizations
- Desktop PWA enhancements
- Voice control (Web Speech API)
- Wearable integration (where supported)
- Advanced gamification

### 11.3 Potential Native Hybrid
If PWA limitations become blocking:
- Capacitor wrapper for native features
- Maintain PWA as primary codebase
- Native features: better background, richer notifications
- Publish to iOS App Store

## 12. Constraints & Assumptions

### 12.1 Technical Constraints
- iOS Safari limitations (no background audio, limited push)
- IndexedDB storage quotas
- Service worker lifecycle restrictions
- No native file system access
- Limited access to system APIs

### 12.2 Design Constraints
- Must work on small screens (iPhone SE)
- Must respect iOS design patterns
- Must handle safe areas (notches, home indicator)
- Must work in both portrait and landscape
- Must respect accessibility settings

### 12.3 Business Constraints
- Free tier of Supabase (optional features)
- No app store fees (staying web-only initially)
- No marketing budget (organic growth)
- Solo developer or small team

### 12.4 Key Assumptions
- Users have iOS 14.5+ devices
- Users have modern Safari browser
- Users understand PWA installation
- Users willing to grant notification permissions
- Primary use case is mobile (phone/tablet)

---

**Questions: libor@arionetworks.com**