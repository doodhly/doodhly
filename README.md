# Doodhly Platform

![CI/CD](https://github.com/YOUR_USERNAME/doodhly/actions/workflows/ci.yml/badge.svg)
![Lighthouse](https://github.com/YOUR_USERNAME/doodhly/actions/workflows/lighthouse.yml/badge.svg)
![Coverage](https://codecov.io/gh/YOUR_USERNAME/doodhly/branch/main/graph/badge.svg)

Doodhly is a modern dairy subscription and delivery management platform.

## Project Structure
- `backend/`: Express.js API (Modular Monolith)
- `doodhly-web/`: Next.js Frontend (Customer & Partner portals)
- `ARCHITECTURE.md`: High-level system overview

## Quick Start
### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env based on .env.example
npm run dev
```

### 2. Frontend Setup
```bash
cd doodhly-web
npm install
# Configure .env based on .env.example
npm run dev
```

## Features
- **OTP Auth**: Passwordless login for customers and partners.
- **Wallet System**: Pre-paid model with Razorpay integration.
- **Subscription Engine**: Flexible daily/weekly/custom schedules.
- **Partner App**: Offline-first delivery verification and route management.
- **Automated Billing**: Daily deductions based on delivery status.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, Knex.js, MySQL.
- **Infrastructure**: JWT for Auth, Twilio for SMS, Razorpay for Payments.
