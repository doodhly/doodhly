#!/bin/bash
set -e

# Doodhly Health Check Script
# Validates that all services are healthy after deployment

API_URL="${1:-http://localhost:5000}"
FRONTEND_URL="${2:-http://localhost:3000}"

echo "🏥 Running health checks..."
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Function to check endpoint
check_endpoint() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "200" ]; then
        echo "✅ OK ($response)"
        return 0
    else
        echo "❌ FAILED ($response)"
        return 1
    fi
}

# Track failures
failures=0

# Check API health
check_endpoint "$API_URL/api/health" "API Health" || ((failures++))

# Check API liveness
check_endpoint "$API_URL/api/health/live" "API Liveness" || ((failures++))

# Check API readiness
check_endpoint "$API_URL/api/health/ready" "API Readiness" || ((failures++))

# Check frontend
check_endpoint "$FRONTEND_URL" "Frontend" || ((failures++))

echo ""

# Get detailed health status
echo "📊 Detailed Health Status:"
curl -s "$API_URL/api/health" | python3 -m json.tool 2>/dev/null || echo "Could not fetch detailed status"

echo ""

# Exit with appropriate code
if [ $failures -eq 0 ]; then
    echo "✅ All health checks passed!"
    exit 0
else
    echo "❌ $failures health check(s) failed"
    exit 1
fi
