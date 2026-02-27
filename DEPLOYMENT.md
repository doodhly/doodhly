# CI/CD Deployment Guide

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline automatically runs tests, performs security scans, and deploys to staging/production environments.

---

## Workflow Jobs

### 1. **test-backend**
- **Trigger**: On push/PR to `main` or `develop`
- **Services**: MySQL 8.0, Redis 7
- **Steps**:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Run database migrations
  5. Execute Jest tests
  6. Upload coverage to Codecov

**Required Environment Variables**:
```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=doodhly_test
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=test-secret-key
```

### 2. **test-frontend**
- **Trigger**: On push/PR to `main` or `develop`
- **Steps**:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Build Next.js app
  5. Run Playwright E2E tests
  6. Upload test reports

### 3. **lint**
- **Trigger**: On push/PR to `main` or `develop`
- **Steps**:
  1. Run ESLint on backend
  2. Run ESLint on frontend

### 4. **security-scan**
- **Trigger**: On push/PR to `main` or `develop`
- **Steps**:
  1. npm audit on backend (high-level vulnerabilities)
  2. npm audit on frontend (high-level vulnerabilities)

### 5. **deploy-staging**
- **Trigger**: Push to `develop` branch
- **Environment**: `staging`
- **URL**: https://staging.doodhly.com
- **Dependencies**: Requires `test-backend`, `test-frontend`, `lint` to pass
- **Steps**:
  1. Deploy to staging environment
  2. Run smoke tests
  3. Send notifications

### 6. **deploy-production**
- **Trigger**: Push to `main` branch
- **Environment**: `production`
- **URL**: https://doodhly.com
- **Dependencies**: Requires all test jobs + security scan to pass
- **Steps**:
  1. Deploy to production environment
  2. Run smoke tests
  3. Send notifications

---

## GitHub Secrets Required

Configure these secrets in **Settings → Secrets and variables → Actions**:

### Deployment Secrets
```
RAILWAY_TOKEN_STAGING      # Railway API token for staging
RAILWAY_TOKEN_PROD         # Railway API token for production
RAILWAY_PROJECT_STAGING    # Staging project ID
RAILWAY_PROJECT_PROD       # Production project ID
```

### Optional Secrets
```
SLACK_WEBHOOK              # Slack webhook for notifications
CODECOV_TOKEN              # Codecov upload token (optional)
```

---

## Environment Configuration

### Staging Environment
- **Name**: `staging`
- **URL**: https://staging.doodhly.com
- **Branch**: `develop`
- **Auto-deploy**: Yes

### Production Environment
- **Name**: `production`
- **URL**: https://doodhly.com
- **Branch**: `main`
- **Auto-deploy**: Yes (requires approval if configured)
- **Protection**: Requires all status checks to pass

---

## Deployment Process

### To Staging
1. Commit and push to `develop` branch
2. GitHub Actions automatically:
   - Runs all tests
   - Performs linting
   - Deploys to staging
   - Runs smoke tests
3. Review deployment at https://staging.doodhly.com

### To Production
1. Create PR from `develop` to `main`
2. Review changes and ensure all checks pass
3. Merge PR to `main`
4. GitHub Actions automatically:
   - Runs all tests + security scan
   - Deploys to production
   - Runs smoke tests
   - Sends team notification
5. Verify deployment at https://doodhly.com

---

## Manual Deployment

If you need to deploy manually:

### Using Railway CLI
```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Deploy to staging
railway link PROJECT_ID_STAGING
railway up

# Deploy to production
railway link PROJECT_ID_PRODUCTION
railway up
```

### Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend to staging
cd doodhly-web
vercel --prod --scope YOUR_TEAM

# Deploy to production
vercel --prod --scope YOUR_TEAM
```

---

## Smoke Tests

Smoke tests verify critical functionality after deployment:

```bash
# Health check
curl -f https://api.doodhly.com/api/health

# Readiness probe
curl -f https://api.doodhly.com/api/health/ready

# Frontend availability
curl -f https://doodhly.com
```

---

## Rollback Procedure

If deployment fails:

1. **Immediate**: Revert last commit on `main` or `develop`
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Railway**: Rollback in dashboard
   - Go to Deployments
   - Select previous successful deployment
   - Click "Redeploy"

3. **Manual**: Deploy previous stable version
   ```bash
   git checkout PREVIOUS_COMMIT_HASH
   railway up
   ```

---

## Performance Monitoring

### Lighthouse CI
- Runs on every PR to `main` or `develop`
- Audits performance, accessibility, SEO
- Targets:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 95+

### View Results
- Check PR comments for Lighthouse report
- Download artifacts from GitHub Actions

---

## Notifications

### Slack Integration
Add webhook to notify team:

```yaml
- name: Notify team
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Production deployment ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Troubleshooting

### Tests fail in CI but pass locally
- Check environment variables
- Verify database/Redis connections
- Review MySQL service logs

### Deployment fails
- Check Railway/Vercel logs
- Verify secrets are configured
- Ensure all dependencies are installed

### Smoke tests timeout
- Increase timeout in workflow
- Check if services are fully started
- Verify health endpoint responds

---

## Local CI Testing

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act  # macOS
choco install act  # Windows

# Run workflow
act -j test-backend

# With secrets
act -j deploy-staging --secret-file .secrets
```

---

## Monitoring Dashboard

Track CI/CD metrics:
- **Success Rate**: % of successful deployments
- **Build Time**: Average time for full pipeline
- **Test Coverage**: Track coverage trends
- **Deployment Frequency**: Deployments per week

Access via: **Actions → Insights**

---

*Last updated: 2026-02-15*
