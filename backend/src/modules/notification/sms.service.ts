
import twilio from 'twilio';
import { AppError } from '../../core/errors/app-error';

export class SmsService {
    private client;
    private fromNumber: string;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

        if (accountSid && authToken) {
            this.client = twilio(accountSid, authToken);
        } else {
            console.warn('TWILIO credentials missing. SMS service will be disabled.');
        }
    }

    async sendOtp(phone: string, otp: string): Promise<boolean> {
        const message = `Your Doodhly verification code is ${otp}. Valid for 5 minutes.`;
        return this.sendMessage(phone, message);
    }

    async sendMessage(phone: string, content: string, channel: 'sms' | 'whatsapp' = 'sms'): Promise<boolean> {
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const to = channel === 'whatsapp' ? `whatsapp:${formattedPhone}` : formattedPhone;
        const from = channel === 'whatsapp' ? `whatsapp:${this.fromNumber}` : this.fromNumber;

        if (!this.client) {
            console.log(`[DEV MODE ${channel.toUpperCase()}] To: ${to}, Message: ${content}`);
            return true;
        }

        try {
            await this.client.messages.create({
                body: content,
                from: from,
                to: to
            });
            return true;
        } catch (error: any) {
            console.error(`Twilio ${channel.toUpperCase()} Error:`, error.message);
            // Fallback for dev/staging
            console.log(`[FALLBACK ${channel.toUpperCase()}] To: ${to}, Message: ${content}`);
            return true;
        }
    }
}
