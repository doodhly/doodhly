
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function runVerification() {
    console.log("1. Starting Verification...");

    try {
        // 1. Login (Auto-create user)
        const phone = '9876543210';
        console.log(`2. Requesting OTP for ${phone}...`);
        await axios.post(`${API_URL}/auth/send-otp`, { phone });

        console.log("3. Verifying OTP...");
        const loginRes = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp: '1234' });
        const token = loginRes.data.accessToken;
        const userId = loginRes.data.user.id;
        console.log(`   > Login successful. User ID: ${userId}`);

        // 2. Insert Mock Delivery Data (to ensure analytics has something to process)
        // We can't easily insert into DB from here without db connection, but 
        // the python service handles "insufficient data" gracefully (returns 0).
        // So we just check if the endpoint works.

        // 3. Call Analytics Dashboard
        console.log("4. Fetching Analytics Dashboard...");
        const dashRes = await axios.get(`${API_URL}/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("   > Response:", JSON.stringify(dashRes.data, null, 2));

        if (dashRes.data.predicted_liters !== undefined && dashRes.data.savings !== undefined) {
            console.log("✅ Analytics API Verified Successfully!");
        } else {
            console.error("❌ Analytics API Response Invalid");
            process.exit(1);
        }

    } catch (error: any) {
        console.error("❌ Verification Failed:", error.message);
        if (error.response) {
            console.error("   Server Response:", error.response.data);
        }
        process.exit(1);
    }
}

runVerification();
