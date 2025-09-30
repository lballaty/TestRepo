# Focus & Productivity Timer - Progressive Web App

**Status:** 🚧 In Development
**Platform:** iOS/Android PWA
**Framework:** Next.js 14 + TypeScript + Tailwind CSS

## Overview

An intelligent, offline-first Progressive Web App designed to help users manage time, build productive habits, and maintain focus across various activities including work, study, exercise, and relaxation.

## Architecture

### Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **State Management:** Zustand
- **Database:** IndexedDB (via idb)
- **Testing:** Jest + React Testing Library
- **PWA:** next-pwa

### Design Principles

#### SOLID Principles
- **Single Responsibility:** Each module has one clear purpose
- **Open/Closed:** Extendable without modification
- **Liskov Substitution:** Interfaces can be swapped
- **Interface Segregation:** Small, focused interfaces
- **Dependency Inversion:** Depend on abstractions

#### Memory-Conscious Design
- Singleton pattern for database connection
- Cursor-based iteration for large datasets
- Automatic cleanup of old data
- No unnecessary object retention
- Efficient IndexedDB usage

## Project Structure

```
web-app/
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   ├── hooks/                  # Custom hooks
│   ├── services/              # Business logic
│   │   ├── database/          # IndexedDB service
│   │   └── repositories/      # Data repositories
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── workers/               # Web Workers (timer engine)
├── public/                     # Static assets
│   └── manifest.json          # PWA manifest
├── __tests__/                 # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── regression/            # Regression tests
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
cd web-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Testing Strategy

**⚠️ CRITICAL: GUI Testing is MANDATORY - ALL UI functions must be tested WITHOUT EXCEPTION**

#### Testing Stack
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright (MANDATORY for all UI workflows)
- **NO framework changes without explicit approval**

#### Coverage Requirements
- Unit Tests: 80% minimum
- Component Tests: 100% coverage
- E2E Tests: 100% of user workflows
- See `TESTING_REQUIREMENTS.md` for detailed requirements

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:regression

# E2E tests with Playwright
npm run test:e2e

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:a11y

# CI mode
npm run test:ci
```

### Building

```bash
npm run build
npm start
```

## PWA Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. App icon appears like a native app

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"

## Features

### Core Functionality
- ✅ Timer engine with precise accuracy
- ✅ Profile management (work, study, exercise, meditation)
- ✅ Session history and statistics
- ✅ Offline-first architecture
- 🚧 Sequence builder (multi-step timers)
- 🚧 AI coaching and insights
- 🚧 Web notifications
- 🚧 Custom sounds and themes

### Technical Features
- ✅ TypeScript for type safety
- ✅ SOLID principles throughout
- ✅ Comprehensive test coverage (80%+ target)
- ✅ Memory-efficient database operations
- ✅ PWA manifest configured
- 🚧 Service worker for offline mode
- 🚧 Background timer with Web Workers
- 🚧 iOS-specific optimizations

## Development Guidelines

### Code Quality
- ESLint + Prettier configured
- 80%+ test coverage required
- TypeScript strict mode enabled
- No `any` types without justification

### Testing Strategy
- **Unit Tests:** Test individual functions/classes
- **Integration Tests:** Test component interactions
- **Regression Tests:** Prevent bug reintroduction

### Git Workflow
- Frequent commits with descriptive messages
- Feature branches for major changes
- Test before committing
- Keep commits focused and atomic

### Commit Format
```
<type>: <description>

<details>

Files changed:
- file1: description
- file2: description

Questions: libor@arionetworks.com
```

Types: feat, fix, test, refactor, docs, chore

## Current Progress

### Phase 1: Foundation ✅ COMPLETE
- [x] Project structure and configuration
- [x] TypeScript setup
- [x] Testing framework (Jest)
- [x] Code quality tools (ESLint, Prettier)
- [x] PWA manifest

### Phase 2: Data Layer 🚧 IN PROGRESS
- [x] Type definitions (Timer, Profile, Session)
- [x] Database interfaces (SOLID)
- [x] IndexedDB service
- [x] Profile repository
- [x] Profile repository tests
- [ ] Session repository
- [ ] Session repository tests

### Phase 3: Business Logic ⏳ PENDING
- [ ] Timer engine (Web Worker)
- [ ] Timer state management
- [ ] Profile management service
- [ ] Session tracking service

### Phase 4: UI Components ⏳ PENDING
- [ ] Main timer display
- [ ] Profile selector
- [ ] Statistics dashboard
- [ ] Settings screen

### Phase 5: PWA Features ⏳ PENDING
- [ ] Service worker
- [ ] Offline mode
- [ ] Install prompt
- [ ] Notifications

### Phase 6: iOS Optimization ⏳ PENDING
- [ ] Safe area handling
- [ ] iOS gestures
- [ ] Dark mode
- [ ] Performance optimization

## Performance Targets

- **Launch Time:** < 2 seconds
- **Timer Accuracy:** ±1 second
- **Memory Usage:** < 100MB
- **Test Coverage:** > 80%
- **Bundle Size:** < 500KB (gzipped)

## Browser Support

- **iOS:** Safari 14.5+
- **Android:** Chrome 90+
- **Desktop:** Chrome, Firefox, Safari, Edge (latest)

## License

Private - Libor Ballaty

## Contact

**Questions:** libor@arionetworks.com

---

**Last Updated:** 2025-09-30