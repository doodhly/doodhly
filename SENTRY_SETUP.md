# Sentry Error Tracking Setup

## Quick Setup (5 minutes)

### 1. Create Free Sentry Account
Visit: https://sentry.io/signup/
- Select "Node.js" for backend project
- Select "React" for frontend project

### 2. Get DSN (Data Source Name)
After creating projects, copy DSNs:
- Backend DSN: `https://xxx@yyy.ingest.sentry.io/zzz`
- Frontend DSN: `https://aaa@bbb.ingest.sentry.io/ccc`

### 3. Add to Environment Variables

**Backend `.env`:**
```env
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
```

### 4. Import Sentry in Application

**Backend** (`src/app.ts` or `src/index.ts` - first line):
```typescript
import { initializeSentry, sentryRequestHandler, sentryErrorHandler } from './config/sentry';

// Initialize Sentry FIRST
initializeSentry();

const app = express();

// Add Sentry request handler (before other middleware)
app.use(sentryRequestHandler);

// ... your routes ...

// Add Sentry error handler (before your error handler)
app.use(sentryErrorHandler);

// ... your error handler ...
```

**Frontend** (`app/layout.tsx` or `pages/_app.tsx`):
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 5. Test Error Tracking
```bash
# Backend test
curl http://localhost:5000/test-sentry-error

# Frontend test (in browser console)
throw new Error("Test Sentry");
```

Check Sentry dashboard for captured errors.

---

## Features Enabled

✅ Automatic error capture  
✅ Stack traces with source maps  
✅ Request context (URL, user, headers)  
✅ Performance monitoring (10% sample)  
✅ Sensitive data filtering  
✅ Environment tagging (dev/prod)

---

## Configuration Options

### Backend (`sentry.ts`)
- **Sample Rate**: 10% of transactions monitored
- **Sensitive Data**: Authorization/cookie headers filtered
- **Disabled In**: Development mode
- **Ignored Errors**: CORS, network failures

### Frontend
- **Sample Rate**: 10% (adjust based on traffic)
- **Release Tracking**: Enable with `release:` option
- **User Feedback**: Enable Sentry widget for user reports

---

## Production Checklist

- [ ] Add `SENTRY_DSN` to production `.env`
- [ ] Verify errors appear in Sentry dashboard
- [ ] Set up email/Slack alerts in Sentry
- [ ] Configure "Ignored Errors" for known issues
- [ ] Enable "Release Tracking" with git commits

---

## Quick Reference

```bash
# Manual error capture
import { captureError } from '@/config/sentry';
try {
  riskyOperation();
} catch (error) {
  captureError(error, { userId: 123, context: 'payment' });
}

# Add user context
import { setUserContext } from '@/config/sentry';
setUserContext(userId, user.email);
```

---

## Troubleshooting

**No errors appearing**: Check DSN in `.env` and restart server  
**Too many errors**: Adjust `ignoreErrors` array or `tracesSampleRate`  
**Sensitive data leaked**: Review `beforeSend` filter in configuration
