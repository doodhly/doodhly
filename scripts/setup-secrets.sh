#!/bin/bash

# Setup Secrets Script for Local Development
# This script creates placeholder secrets files in backend/secrets/

SECRETS_DIR="./backend/secrets"
mkdir -p "$SECRETS_DIR"

generate_secret() {
    local name=$1
    local value=$2
    local file="$SECRETS_DIR/$name.txt"
    
    if [ ! -f "$file" ]; then
        echo "Creating $name..."
        echo "$value" > "$file"
    else
        echo "$name already exists, skipping."
    fi
}

echo "Initializing local development secrets..."

generate_secret "jwt_secret" "dev_jwt_secret_must_be_over_32_chars_long_for_prod"
generate_secret "razorpay_key_id" "rzp_test_placeholder"
generate_secret "razorpay_key_secret" "rzp_secret_placeholder"
generate_secret "twilio_account_sid" "AC_placeholder"
generate_secret "twilio_auth_token" "token_placeholder"
generate_secret "twilio_phone_number" "+1234567890"

echo "✅ Local secrets setup complete. Remember to NOT commit the .txt files."
