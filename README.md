# Stylr SA

A comprehensive salon booking and discovery platform for South Africa.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x (see `.nvmrc`)
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd stylr-sa

# Install dependencies
npm install

# Setup environment variables
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Run database migrations
cd backend && npx prisma migrate dev

# Start development servers
npm run dev
```

## 📁 Project Structure

```
stylr-sa/
├── frontend/          # Next.js 15 frontend application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utilities and API client
│   │   ├── context/   # React context providers
│   │   └── types/     # TypeScript types
│   └── public/        # Static assets
│
├── backend/           # NestJS backend API
│   ├── src/
│   │   ├── auth/      # Authentication module
│   │   ├── salons/    # Salon management
│   │   ├── bookings/  # Booking system
│   │   ├── services/  # Service management
│   │   └── ...        # Other modules
│   └── prisma/        # Database schema & migrations
│
├── shared/            # Shared types and contracts
├── docs/              # Project documentation
└── scripts/           # Utility scripts
```

## 🛠 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- CSS Modules

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- Socket.io (real-time)

### Infrastructure
- Vercel (Frontend)
- Railway (Backend & Database)
- Cloudinary (Media)

## 📚 Documentation

See the [docs/](./docs/README.md) folder for detailed documentation:

- [Setup Guide](./docs/guides/SETUP_INSTRUCTIONS.md)
- [Deployment](./docs/deployment/)
- [SEO Implementation](./docs/seo/)
- [Feature Documentation](./docs/features/)

## 🧪 Development

```bash
# Run frontend dev server
cd frontend && npm run dev

# Run backend dev server
cd backend && npm run start:dev

# Run tests
npm test

# Lint code
npm run lint
```

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

Private - All rights reserved
