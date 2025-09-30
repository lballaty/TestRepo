# LiveLong ⊹

A productivity timer inspired by Japanese longevity wisdom, combining traditional focus techniques with breathing exercises and wellness practices.

## ✨ Features

### 🍅 **Classic Focus Timers**
- Pomodoro (25 min) - Classic productivity technique
- Deep Work (90 min) - Extended focus sessions
- Custom durations - Flexible timing with minutes and seconds

### 🏯 **Japanese Longevity Exercises**
- **Rajio Taiso** - Traditional Japanese radio calisthenics
- **Tai Chi Morning** - Gentle flowing movements
- **Shinrin-yoku** - Forest bathing meditation
- **Ikigai Reflection** - Purpose and meaning contemplation
- **Zazen Sitting** - Seated Zen meditation

### 🫁 **Breathing Exercises with Visual Guides**
- **Box Breathing** - Navy SEAL focus technique (4-4-4-4)
- **4-7-8 Relaxation** - Dr. Andrew Weil's natural tranquilizer
- **Deep Breathing** - Simple stress relief breathing
- **Immersive Experience** - Full-screen breathing visualizer with background animations

### 📱 **Progressive Web App (PWA)**
- Install on mobile devices
- Offline functionality
- Native app experience
- Quick action shortcuts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Development Scripts

```bash
# Start development server (with automatic cleanup + browser opening)
./start.sh

# Start with deep cache reset (clears npm cache too)
./start.sh reset

# Stop all processes and cleanup
./stop.sh

# Run comprehensive tests
./test.sh
```

### Manual Commands

```bash
# Install dependencies
cd web-app && npm install

# Start development server
cd web-app && npm run dev

# Build for production
cd web-app && npm run build

# Run tests
cd web-app && npx playwright test
```

---

## 🤖 AI-Assisted Development

This project is configured for autonomous development with multiple AI assistants.

### Using Claude Code ⚡ (Autonomous)

1. **Open project in Claude Code**
2. **Read CLAUDE.md** for quick start prompt
3. **Copy and paste the prompt** - Claude will:
   - Read all documentation
   - Work through TODO.md systematically
   - Write tests before implementation
   - Commit automatically with proper format
   - Update documentation as it progresses

**One-liner to start:**
```
Read CLAUDE.md and follow the quick start instructions.
```

### Using Google Gemini 🔷 (Autonomous)

1. **Open Google Gemini** (AI Studio or API)
2. **Share project files** or connect to repository
3. **Read GEMINI.md** for quick start prompt
4. **Copy and paste the prompt** - Gemini will:
   - Follow .gemini/config.yaml workflow
   - Work through TODO.md systematically
   - Write tests before implementation
   - Ask for approval before commits
   - Coordinate with other AIs via TODO.md

**One-liner to start:**
```
Read GEMINI.md and follow the quick start instructions.
```

### Using ChatGPT 🤝 (Guided)

1. **Share PROJECT_RULES.md** with the assistant
2. **Tell it:** "Follow PROJECT_RULES.md for all development. Start with docs/TODO.md."
3. **Assistant will ask before changes** (no auto-commit)
4. **You approve each change** before it's applied

### 🤝 Multi-AI Coordination

**All three AI assistants can work on the same project!**

- **Source of Truth:** `docs/TODO.md`
- **Handoff Protocol:**
  1. Update TODO.md with current state
  2. Commit all changes
  3. Document blockers or questions
  4. Next AI checks git log and TODO.md

**Example workflow:**
- Morning: Use Claude Code for rapid feature development
- Afternoon: Switch to Gemini for code review and optimization
- Evening: Use ChatGPT for documentation and planning
- **All changes tracked in TODO.md for seamless handoffs**

---

## 📋 Key Files

### Configuration
- **`.claude/settings.local.json`** - Claude Code permissions and hooks
- **`.gemini/config.yaml`** - Gemini workflow configuration
- **`CLAUDE.md`** - Quick start guide for Claude Code
- **`GEMINI.md`** - Quick start guide for Google Gemini
- **`PROJECT_RULES.md`** - Universal development rules for all AI assistants

### Documentation
- **`docs/TODO.md`** - Current tasks and priorities
- **`docs/REQUIREMENTS.md`** - What we're building
- **`docs/SPECIFICATIONS.md`** - Technical implementation details
- **`docs/DESIGN.md`** - Architecture and design decisions

### Project Structure
```
TestRepo/
├── .claude/
│   └── settings.local.json    # Claude Code configuration
├── .gemini/
│   ├── config.yaml            # Gemini workflow configuration
│   └── style-guide.md         # Gemini style guide
├── src/
│   ├── core/                  # Core business logic
│   ├── api/                   # API endpoints
│   ├── models/                # Data models
│   ├── utils/                 # Utility functions
│   └── config/                # Configuration
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── regression/            # Regression test suites
│   └── fixtures/              # Test data
├── docs/                      # Documentation
├── CLAUDE.md                  # Claude quick start
├── GEMINI.md                  # Gemini quick start
├── PROJECT_RULES.md           # Development rules
└── README.md                  # This file
```

---

## 🎯 Development Workflow

All AI assistants (Claude Code, Gemini, ChatGPT) follow this workflow:

1. **Read context** (REQUIREMENTS, SPECIFICATIONS, DESIGN, TODO)
2. **Check TODO.md** for next task
3. **Write tests first** (TDD approach)
4. **Implement feature**
5. **Run all tests** (unit + regression)
6. **Commit with proper format**
7. **Update docs** (TODO, DESIGN, etc.)
8. **Move to next task**

### Multi-AI Handoff Protocol
When switching between AI assistants:
1. Ensure all changes are committed
2. Update TODO.md with current state
3. Document any blockers or open questions
4. Next AI reads git log and TODO.md to continue

---

## 🧪 Testing

### Run Tests
```bash

# Node.js
npm test                        # All tests
npm run test:coverage           # With coverage
npm run test:unit               # Unit tests only
npm run test:integration        # Integration tests only
npm test -- --testPathPattern=auth  # Specific tests
```

### Test Coverage Goals
- **Minimum**: 80% code coverage
- **Critical paths**: 100% coverage
- **All edge cases**: Tested

---

## 📝 Git Commit Format

All commits follow this format:

```
<type>: <short description>

<detailed explanation if needed>

Files changed:
- path/to/file1: [what changed]
- path/to/file2: [what changed]

Questions: libor@arionetworks.com
```

**Types**: feat, fix, docs, test, refactor, perf, chore

---

## 🔒 Security

- No secrets in code (use `.env` files)
- `.env` files are git-ignored
- Environment variables for configuration
- All sensitive data encrypted

---

## 📞 Contact

**Questions or Issues**: libor@arionetworks.com

---

## 📊 Project Status

- **Status**: Initialized
- **Created**: 2025-09-30
- **Template**: node
- **AI Ready**: ✅ Claude Code + Google Gemini (autonomous) + ChatGPT (guided)
- **Multi-AI Coordination**: ✅ Enabled via docs/TODO.md

---

## 🚦 Next Steps

1. **Fill in documentation**: Update REQUIREMENTS.md, SPECIFICATIONS.md, DESIGN.md
2. **Define first tasks**: Add specific items to TODO.md
3. **Start development**: Choose your AI assistant:
   - **Claude Code**: Open in Claude, say "Read CLAUDE.md and start"
   - **Google Gemini**: Share files, say "Read GEMINI.md and start"
   - **ChatGPT**: Share PROJECT_RULES.md, say "Follow these rules"
4. **Let AI build**: Follow the autonomous workflow
5. **Switch AIs anytime**: All coordinate via TODO.md

**Happy coding with your AI team! 🎉**
