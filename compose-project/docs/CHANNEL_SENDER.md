# Channel Sender Service

Automatically posts new jobs to the Telegram channel `@batumiworkofficial`.

## Overview

The Channel Sender service monitors for new jobs and posts them to the Telegram channel with proper queuing, business hours scheduling, and retry mechanisms.

## Configuration

### Environment Variables

```bash
# Telegram
CHANNEL_BOT_TOKEN=your-bot-token-here
TELEGRAM_CHANNEL_ID=@batumiworkofficial

# Admin API port
SENDER_API_PORT=127.0.0.1:8102
```

### Business Hours

- **Active Hours**: 9 AM - 9 PM Georgian time (UTC+4)
- Messages are only sent during business hours
- Jobs queued outside hours are scheduled for next 9 AM

### Rate Limiting

- Max 20 messages per minute
- Max 60 messages per hour
- 3 second delay between messages

## Message Format

```
#IT_და_პროგრამირება #Remote
Senior React Developer
Company: XYZ
Salary: 3000-5000 GEL
Apply: https://batumi.work/ge/job.html?id=UUID
```

- Category hashtag in Georgian (spaces → underscores)
- `#Remote` hashtag if `remote_type != 'onsite'`
- Salary only if `has_salary = true`

## Database Tables

### `channel_message_queue`

Pending messages to be sent.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | FK to jobs (unique) |
| status | VARCHAR | pending/processing/sent/failed/cancelled |
| priority | INT | Higher = more urgent |
| scheduled_at | TIMESTAMPTZ | When to send |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Updated timestamp |

### `channel_message_history`

History of sent/failed messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | FK to jobs |
| queue_id | UUID | FK to queue (nullable) |
| telegram_message_id | BIGINT | Telegram's message ID |
| status | VARCHAR | sent/failed/deleted |
| message_text | TEXT | The message content |
| error_message | TEXT | Error details if failed |
| retry_count | INT | Number of retries |
| sent_at | TIMESTAMPTZ | When sent |

## Scheduled Tasks

| Task | Interval | Description |
|------|----------|-------------|
| `scan_new_jobs` | 5 minutes | Find active jobs not yet queued |
| `process_queue` | 30 seconds | Send queued messages |
| `cleanup_old` | Daily 3 AM | Remove old entries |
| `daily_report` | Daily 9:30 PM | Email summary via Mailpit |

## Admin API Endpoints

Base URL: `http://localhost:8102`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sender/health` | Health check |
| GET | `/sender/status` | Queue size, rate limits, business hours |
| GET | `/sender/queue` | List pending items |
| GET | `/sender/queue/failed` | List failed items |
| GET | `/sender/history` | Sent messages (filterable) |
| GET | `/sender/history/stats` | History statistics |
| POST | `/sender/retry/{id}` | Retry failed message |
| POST | `/sender/retry-all-failed` | Retry all failed |
| DELETE | `/sender/queue/{id}` | Cancel queued message |
| POST | `/sender/pause` | Pause sending |
| POST | `/sender/resume` | Resume sending |

### Example: Check Status

```bash
curl http://localhost:8102/sender/status
```

Response:
```json
{
  "paused": false,
  "queue": {
    "pending": 0,
    "processing": 0,
    "sent": 598,
    "failed": 0,
    "cancelled": 0,
    "total": 598
  },
  "rate_limits": {
    "messages_sent_this_minute": 0,
    "max_per_minute": 20,
    "can_send_now": true
  },
  "business_hours": {
    "current_time_georgia": "2026-01-20T09:25:37+04:00",
    "is_business_hours": true,
    "business_hours": "9:00 - 21:00 (UTC+4)"
  }
}
```

### Example: Pause/Resume

```bash
# Pause sending
curl -X POST http://localhost:8102/sender/pause

# Resume sending
curl -X POST http://localhost:8102/sender/resume
```

### Example: Retry Failed

```bash
# Retry single message
curl -X POST http://localhost:8102/sender/retry/{queue_id}

# Retry all failed
curl -X POST http://localhost:8102/sender/retry-all-failed
```

## Docker Compose

Start the sender service:

```bash
# Start sender and mailpit
docker compose --profile sender up -d

# Or start everything
docker compose --profile full up -d
```

View logs:

```bash
docker compose logs sender -f
```

## File Structure

```
sender/
├── Dockerfile
├── requirements.txt
└── app/
    ├── main.py              # Entry point + APScheduler
    ├── core/
    │   ├── config.py        # Environment config
    │   ├── database.py      # Async SQLAlchemy
    │   ├── logging.py       # Structlog
    │   └── telegram.py      # Telegram API client
    ├── models/
    │   ├── queue.py         # ChannelMessageQueue
    │   └── history.py       # ChannelMessageHistory
    ├── services/
    │   ├── formatter_service.py   # Message formatting
    │   ├── scheduler_service.py   # Business hours
    │   ├── queue_service.py       # Queue CRUD
    │   └── sender_service.py      # Send orchestration
    ├── tasks/
    │   ├── job_scanner.py         # Find new jobs
    │   ├── queue_processor.py     # Process queue
    │   └── reporting.py           # Daily reports
    └── api/
        ├── main.py           # FastAPI app
        ├── routes.py         # Admin endpoints
        └── schemas.py        # Pydantic schemas
```

## Mailpit (Email Reports)

Daily reports are sent via Mailpit for development/testing.

- **SMTP**: `mailpit:1025`
- **Web UI**: `http://server-ip:8025`

## Troubleshooting

### Messages not sending

1. Check if within business hours (9 AM - 9 PM Georgia)
2. Check if paused: `curl http://localhost:8102/sender/paused`
3. Check queue: `curl http://localhost:8102/sender/status`
4. Check logs: `docker compose logs sender --tail 50`

### Rate limit hit

The service automatically respects rate limits. Wait for the counter to reset (1 minute for per-minute limit, 1 hour for hourly limit).

### Telegram API errors

Check the history for error messages:

```bash
curl "http://localhost:8102/sender/history?status=failed"
```

Common errors:
- `chat not found`: Bot not added to channel as admin
- `too many requests`: Rate limited by Telegram (automatic retry)
