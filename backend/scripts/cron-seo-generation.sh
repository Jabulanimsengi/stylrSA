#!/bin/bash

# SEO Page Generation Cron Job
# This script runs nightly to pre-generate all SEO pages
# Schedule: 0 2 * * * (2 AM daily)

# Set working directory
cd "$(dirname "$0")/.." || exit 1

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set batch size (default: 1000)
export SEO_BATCH_SIZE=${SEO_BATCH_SIZE:-1000}

# Log file with timestamp
LOG_DIR="logs/seo-generation"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/seo-generation-$(date +%Y%m%d-%H%M%S).log"

echo "========================================" | tee -a "$LOG_FILE"
echo "SEO Page Generation Started" | tee -a "$LOG_FILE"
echo "Timestamp: $(date)" | tee -a "$LOG_FILE"
echo "Batch Size: $SEO_BATCH_SIZE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Run the generation script
START_TIME=$(date +%s)

npx ts-node scripts/generate-seo-pages.ts 2>&1 | tee -a "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
DURATION_MIN=$((DURATION / 60))

echo "========================================" | tee -a "$LOG_FILE"
echo "SEO Page Generation Completed" | tee -a "$LOG_FILE"
echo "Exit Code: $EXIT_CODE" | tee -a "$LOG_FILE"
echo "Duration: ${DURATION_MIN} minutes" | tee -a "$LOG_FILE"
echo "Timestamp: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Send alert on failure (if monitoring webhook is configured)
if [ $EXIT_CODE -ne 0 ] && [ -n "$MONITORING_WEBHOOK_URL" ]; then
  curl -X POST "$MONITORING_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"alert\": \"SEO Generation Failed\",
      \"exit_code\": $EXIT_CODE,
      \"duration_minutes\": $DURATION_MIN,
      \"timestamp\": \"$(date -Iseconds)\",
      \"log_file\": \"$LOG_FILE\"
    }"
fi

# Clean up old logs (keep last 30 days)
find "$LOG_DIR" -name "seo-generation-*.log" -mtime +30 -delete

exit $EXIT_CODE
