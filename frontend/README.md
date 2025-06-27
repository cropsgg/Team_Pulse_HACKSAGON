# ImpactChain & CharityChain Frontend

A world-class Next.js 15 frontend application for ImpactChain & CharityChain - an AI-powered decentralized blockchain DAO platform revolutionizing funding for startups, charitable causes, and individuals in need.

## 🚀 Features

### Core Platform Features
- **CharityChain**: Donations to NGOs and individuals in need
- **ImpactChain**: VC to startup funding and investment management
- **AI-Powered Review System**: Automated feasibility and impact assessments
- **DAO Governance**: Decentralized voting and decision-making
- **Blockchain Transparency**: Complete on-chain verification
- **Multi-language Support**: 12-language localization with RTL support

### Technical Highlights
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS + shadcn/ui** for world-class design system
- **wagmi + viem** for Web3 integration
- **Framer Motion** for smooth animations
- **WCAG AA Compliance** for accessibility
- **Mobile-First PWA** with offline support

## 🛠 Tech Stack

### Core Framework
- Next.js 15 (App Router)
- React 19
- TypeScript 5

### Styling & UI
- Tailwind CSS 3.4
- shadcn/ui components
- Radix UI primitives
- Framer Motion animations
- Lucide React icons

### Web3 Integration
- wagmi 2.5
- viem 2.7
- ConnectKit
- Ethers.js 6

### State Management & Data
- Zustand for client state
- TanStack Query for server state
- React Hook Form + Zod validation

### Additional Features
- next-intl for i18n
- next-themes for dark mode
- React Markdown for content
- Recharts for data visualization
- Three.js for 3D graphics

## 🎨 Design System

### Color Palette
- **Primary Brand**: `#5667FF` (Base blue)
- **Ink**: `#1B1D36` (Dark text)
- **Paper**: `#F2F5FF` (Light background)
- **Semantic Colors**: Success (green), Warning (amber), Error (red)

### Typography
- **Font**: Inter (system fallback)
- **Fluid Scaling**: `clamp()` functions for responsive text
- **Hierarchy**: Consistent scale from xs to 5xl

### Spacing & Layout
- **8pt Grid System**: Consistent spatial rhythm
- **Container Queries**: Responsive components
- **Accessibility**: WCAG AA contrast ratios

## 📱 Key Pages & Features

### Public Pages
- **/** - Hero landing with animated KPIs
- **/explore** - Master directory with advanced filtering
- **/project/[slug]** - Dynamic project details
- **/how-it-works** - Process explanation
- **/impact** - Global impact dashboard
- **/governance** - DAO proposals and voting

### Authenticated Areas
- **/dashboard** - Role-based user dashboard
- **/console** - Founder/NGO management
- **/create/ngo** - Charity creation wizard
- **/create/startup** - Startup funding wizard
- **/funding/[roundId]** - Investment room

### Special Features
- **Milestone Verification**: AI-powered milestone tracking
- **Support Bot**: Embedded AI assistance
- **Real-time Updates**: Live funding and voting data
- **Multi-signature Wallets**: Secure fund management

## 🔐 Web3 Integration

### Supported Wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- Magic Link (for non-Web3 users)

### Blockchain Features
- **Base Network**: Primary blockchain
- **Smart Contracts**: Automated funding and equity
- **SIWE**: Sign-In-With-Ethereum authentication
- **Gas Optimization**: Efficient transaction batching

## 🌍 Internationalization

### Supported Languages
- English, Hindi, Spanish, French, German
- Arabic (RTL support), Chinese, Japanese
- Portuguese, Italian, Dutch, Russian

### Features
- **Context-aware translations**
- **Currency localization**
- **Date/time formatting**
- **Number formatting**

## 📊 Performance & Optimization

### Core Web Vitals
- **LCP**: < 2.5s with image optimization
- **FID**: < 100ms with code splitting
- **CLS**: < 0.1 with skeleton loading

### Optimization Strategies
- Server Components by default
- Dynamic imports for heavy components
- Image optimization with Next.js
- Service Worker for offline support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key

# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   ├── forms/          # Form components
│   │   └── charts/         # Data visualization
│   ├── lib/                # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   ├── providers/          # React context providers
│   ├── types/              # TypeScript definitions
│   ├── data/               # Mock data and constants
│   └── graphql/            # GraphQL queries/mutations
├── public/                 # Static assets
├── messages/               # i18n translations
└── docs/                   # Documentation
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm run test
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Deployment Platforms
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker** support available

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: GitHub Issues
- **Discord**: Community support channel

---

Built with ❤️ for the future of decentralized funding and social impact. 