# CRM VoIP Application

A comprehensive CRM with VoIP capabilities built with React, Node.js, and Twilio.

## Features
- Visual dashboard with user cards
- Drag & drop call management
- Call parking and transfer
- Real-time status updates
- Twilio integration for voice communications

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js server
- PostgreSQL database
- Socket.io for real-time updates
- Twilio for VoIP functionality

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- dnd-kit for drag & drop
- Socket.io-client for real-time updates

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for production)
- Twilio account (for VoIP features)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and Twilio credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
1. Create a PostgreSQL database named `crm_voip`
2. Run migrations:
```bash
psql -d crm_voip -f migrations/001_create_users_table.sql
psql -d crm_voip -f migrations/002_create_calls_table.sql
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number

## Deployment

This application is designed to be deployed on Railway for Twilio webhook compatibility.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
railway login
railway link
railway up
```

## Phase Implementation

See [PHASE_PLAN.md](./PHASE_PLAN.md) for detailed implementation phases.

Current Status: **Phase 1 Complete** - Basic infrastructure setup

## License

MIT# crm-claude
