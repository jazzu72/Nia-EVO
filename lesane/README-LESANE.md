# 🎷 Nia LeSane - Merged into Nia-EVO

> **Autonomous, Soulful, Powerful.** Premium CEO application with quantum computing, biometric security, and premium UX.

*This directory contains the integrated Nia-Lesane codebase merged into Nia-EVO.*

## ✨ Features Integrated

- 🔐 **Biometric Authentication** - Secure login with Face ID / Touch ID
- ⚛️ **Quantum Integration** - Azure Quantum backend for advanced computations
- 💳 **Stripe Payments** - Seamless monetization
- 📱 **Premium React Native/Expo** - Best-in-class mobile UX
- 🎨 **Dark Mode & Glassmorphism** - Beautiful visual design
- 📧 **Twilio Integration** - SMS/Voice communication
- 🧪 **Type-Safe TypeScript** - 100% strict mode
- ✅ **Comprehensive Testing** - Jest with 70%+ coverage

## 📁 Directory Structure

```
lesane/
├── src/                      # React Native source code
│   ├── components/          # Reusable UI components
│   ├── screens/             # Application screens
│   ├── services/            # Business logic
│   │   ├── AuthService.ts
│   │   ├── QuantumService.ts
│   │   ├── TwilioService.ts
│   │   └── PerformanceService.ts
│   ├── config/              # Configuration
│   ├── styles/              # Theme & styling
│   └── tests/               # Test files
├── integrations/            # External integrations
│   ├── azure/              # Azure Quantum Python backend
│   └── [other services]/
├── scripts/                 # Deployment & setup
│   ├── Quicksetup.sh
│   ├── launch_preflight.ps1
│   └── clean-runway.ps1
├── pwa/                     # Progressive Web App
├── config/                  # App configurations
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── metro.config.js
│   └── eas.json
├── package.json            # Dependencies
└── package-lock.json
```

## 🚀 Quick Start

### Installation

```bash
cd lesane
npm install
cp .env.example .env
# Edit .env with your credentials
```

### Development

```bash
# Start Expo dev server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

### Code Quality

```bash
npm run type-check    # TypeScript validation
npm run lint          # ESLint
npm run format        # Prettier
npm run validate      # All checks
npm test             # Jest tests
```

## 🔐 Environment Variables

See `.env.example` for required variables:
- `SPECIAL_PASSWORD` - CEO authentication
- `AZURE_API_BASE_URL` - Quantum backend
- `STRIPE_PUBLISHABLE_KEY` - Payments
- `TWILIO_ACCOUNT_SID` - SMS/Voice
- `TWILIO_AUTH_TOKEN` - Twilio auth
- `USER_PHONE` - Notification target

## 📚 Documentation

- **CONTRIBUTING.md** - Contribution guidelines
- **DOCUMENTATION.md** - Technical documentation
- **LAUNCH_QUICK_REF.md** - Quick reference

## 🛠️ Integration Notes

This merge combines:
- **Nia-EVO**: Backend services & infrastructure
- **Nia-Lesane**: Premium React Native frontend & quantum computing

**Key Integration Points:**
1. Azure Quantum API (Python backend in `/integrations/azure/`)
2. Stripe payment processing
3. Twilio SMS/Voice services
4. Biometric authentication via Expo
5. Type-safe TypeScript architecture

## 📖 For More Information

See the original README files and CONTRIBUTING guide for complete documentation.

---

**Built with ❤️ by House of Jazzu**
