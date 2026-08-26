#!/bin/bash
# Run capture batches sequentially, logging progress
set -e
cd "$(dirname "$0")/.."
BATCH_SIZE=5
START_BATCH=${1:-0}
END_BATCH=${2:-19}
LOG="scripts/capture-progress.log"
echo "Starting batches $START_BATCH to $END_BATCH at $(date)" | tee -a "$LOG"

for ((b=START_BATCH; b<=END_BATCH; b++)); do
  echo "=== Batch $b ===" | tee -a "$LOG"
  node scripts/run-all-captures.mjs "$BATCH_SIZE" "$b" 2>&1 | tee -a "$LOG" || {
    echo "Batch $b failed at $(date)" | tee -a "$LOG"
    exit 1
  }
  echo "Batch $b done at $(date)" | tee -a "$LOG"
done

echo "All batches complete at $(date)" | tee -a "$LOG"
