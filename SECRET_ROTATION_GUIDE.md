# Security Migration & Secret Rotation Guide

This guide details how to rotate secrets in the Doodhly platform following the migration to Docker Secrets.

## Secret Rotation Procedure

1. **Generate New Secrets**: Create new random values for your secrets (JWT, Razorpay, Twilio).
2. **Update Files**: Replace the content of the `.txt` files in the `backend/secrets/` directory (or your production secret store).
   ```bash
   echo "new_secret_value" > backend/secrets/jwt_secret.txt
   ```
3. **Redeploy Services**:
   - If using **Docker Compose**:
     ```bash
     docker-compose up -d --force-recreate backend
     ```
   - If using **Docker Swarm**:
     Update the secret version and update the service to use the new secret.
4. **Verification**: Check the backend logs to ensure the new secrets are loaded successfully and the validation passes.

## Local Development Setup

Run the provided setup script to initialize placeholder secrets:
```bash
bash scripts/setup-secrets.sh
```

## Production Security Checklist

- [x] Ensure `JWT_SECRET` is at least 32 characters long.
- [x] Verify that the `secrets/` directory is NOT committed to version control.
- [x] Ensure that `CORS_ORIGIN` is explicitly set to your production domain in `docker-compose.yml`.
