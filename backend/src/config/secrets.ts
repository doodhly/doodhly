import fs from 'fs';
import path from 'path';
import logger from '../core/utils/logger';

/**
 * Loads a secret from Docker secret store or fallback to environment variable.
 * @param secretName The name of the secret (e.g., 'jwt_secret')
 * @returns The secret value
 */
export function getSecret(secretName: string): string {
    const envVarName = `${secretName.toUpperCase()}_FILE`;
    const secretPath = process.env[envVarName];

    // 1. Try Docker Secret File
    if (secretPath && fs.existsSync(secretPath)) {
        try {
            return fs.readFileSync(secretPath, 'utf8').trim();
        } catch (err) {
            logger.error(`Error reading secret file at ${secretPath}:`, err);
        }
    }

    // 2. Fallback to direct environment variable
    const fallbackEnvVar = secretName.toUpperCase();
    const value = process.env[fallbackEnvVar];

    if (!value) {
        if (process.env.NODE_ENV === 'production') {
            logger.error(`FATAL: Secret ${secretName} is missing in production!`);
            process.exit(1);
        }
        return '';
    }

    // 3. Basic Security Validation (Entropy/Length)
    if (process.env.NODE_ENV === 'production' && value.length < 32) {
        logger.warn(`WARNING: Secret ${secretName} is potentially weak (< 32 chars).`);
    }

    return value;
}

export const secrets = {
    JWT_SECRET: getSecret('jwt_secret'),
    JWT_REFRESH_SECRET: getSecret('jwt_refresh_secret'),
    RAZORPAY_KEY_ID: getSecret('razorpay_key_id'),
    RAZORPAY_KEY_SECRET: getSecret('razorpay_key_secret'),
    TWILIO_ACCOUNT_SID: getSecret('twilio_account_sid'),
    TWILIO_AUTH_TOKEN: getSecret('twilio_auth_token'),
    TWILIO_PHONE_NUMBER: getSecret('twilio_phone_number'),
};

/**
 * Validates that all critical secrets are present and meet security standards.
 */
export function validateSecrets() {
    const criticalSecrets = Object.keys(secrets) as Array<keyof typeof secrets>;
    let missingCount = 0;

    criticalSecrets.forEach((key) => {
        if (!secrets[key]) {
            logger.error(`Config Error: Missing critical secret [${key}]`);
            missingCount++;
        }
    });

    if (missingCount > 0) {
        process.exit(1);
    }

    logger.info('✅ All critical secrets loaded and validated.');
}
