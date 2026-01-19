# Telegram Bot Setup Guide

This guide walks you through creating a Telegram bot for the Georgia Job Board.

---

## Prerequisites

- A Telegram account
- Access to Telegram (mobile app or desktop)

---

## Creating a Bot with BotFather

### Option 1: Desktop App (Windows/Mac/Linux)

1. **Open Telegram Desktop**
   - Download from [desktop.telegram.org](https://desktop.telegram.org) if not installed

2. **Find BotFather**
   - Click the search icon (magnifying glass) at the top
   - Type `@BotFather`
   - Click on the official BotFather (has a blue checkmark)

3. **Start BotFather**
   - Click "START" button or type `/start`
   - You'll see a list of available commands

4. **Create New Bot**
   - Type `/newbot` and press Enter
   - BotFather will ask for a name for your bot

5. **Choose Bot Name**
   - Enter a display name (e.g., `Georgia Jobs Bot`)
   - This is the name users will see

6. **Choose Username**
   - Enter a unique username ending in `bot` (e.g., `batumi_jobs_bot`)
   - Must be unique across all Telegram bots
   - If taken, try variations like `georgia_jobboard_bot`

7. **Save Your Token**
   - BotFather will send you a token like:
     ```
     7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
     ```
   - **IMPORTANT**: Save this token securely - you'll need it for configuration
   - Never share this token publicly

---

### Option 2: Mobile App (iOS/Android)

1. **Open Telegram App**
   - Launch Telegram on your phone

2. **Search for BotFather**
   - Tap the search icon (magnifying glass)
   - Type `@BotFather`
   - Tap on the official BotFather account (has a blue verified checkmark)

3. **Start Conversation**
   - Tap "START" at the bottom of the screen
   - Or type `/start` and send

4. **Create New Bot**
   - Type `/newbot` and send
   - Follow the prompts:

5. **Enter Bot Name**
   - Type your bot's display name (e.g., `Georgia Jobs Bot`)
   - Send the message

6. **Enter Bot Username**
   - Type a unique username ending in `bot`
   - Examples: `batumi_jobs_bot`, `georgia_work_bot`
   - Send the message

7. **Copy Your Token**
   - Long-press on the token message
   - Select "Copy"
   - Paste it somewhere safe (notes app, password manager)

---

## Configuring the Bot

### 1. Add Token to Environment

Edit your `.env` file in the `compose-project` directory:

```bash
# Open .env file
nano .env  # or use any text editor

# Add this line
TELEGRAM_BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

Replace with your actual token.

### 2. Configure Website URL

```bash
# In .env file
WEB_URL=https://batumi.work
```

This URL is used for job links sent by the bot.

### 3. Start the Bot Service

```bash
# Start the bot
docker-compose --profile bot up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f bot
```

---

## Optional: Customize Your Bot

### Set Bot Description

In BotFather, send:
```
/setdescription
```
Then select your bot and enter a description like:
```
Search jobs in Georgia, subscribe to categories, and get daily notifications about new job postings.
```

### Set Bot About Text

```
/setabouttext
```
Enter:
```
Official job search bot for batumi.work - Georgia's job board.
```

### Set Bot Profile Picture

```
/setuserpic
```
Then select your bot and upload an image (recommended: 512x512 pixels).

### Set Bot Commands Menu

```
/setcommands
```
Select your bot and paste:
```
start - Start the bot and choose language
search - Search for jobs
latest - Show latest job postings
subscribe - Subscribe to job categories
unsubscribe - Manage your subscriptions
help - Show available commands
```

This creates a nice menu when users type `/` in the chat.

---

## Testing the Bot

1. **Find Your Bot**
   - Search for your bot's username in Telegram
   - Or click the link BotFather provided: `t.me/your_bot_username`

2. **Start the Bot**
   - Click "START"
   - You should see the language selection buttons

3. **Test Commands**
   - `/search developer` - Should return job results
   - `/latest` - Should show recent jobs
   - `/subscribe` - Should show category list
   - `/help` - Should show command list

---

## Troubleshooting

### Bot Not Responding

1. **Check if the service is running:**
   ```bash
   docker-compose ps | grep bot
   ```

2. **Check logs for errors:**
   ```bash
   docker-compose logs bot --tail=50
   ```

3. **Verify token is set:**
   ```bash
   docker-compose exec bot env | grep TELEGRAM
   ```

### "Unauthorized" Error in Logs

- Token is incorrect
- Regenerate token with BotFather: `/token` then select your bot

### Bot Running but No Response

- Check API connectivity:
  ```bash
  docker-compose exec bot curl http://api:8000/health
  ```
- Ensure API service is healthy

### Database Connection Error

- Check database is running:
  ```bash
  docker-compose ps | grep db
  ```
- Verify DATABASE_URL in bot environment

---

## Security Best Practices

1. **Never commit your token to git**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Regenerate token if compromised**
   - In BotFather: `/revoke`
   - Select your bot
   - Update `.env` with new token
   - Restart bot service

3. **Monitor bot usage**
   ```bash
   docker-compose logs bot | grep -i error
   ```

---

## Bot Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Initialize bot, select language | Just send `/start` |
| `/search <query>` | Search jobs | `/search developer` |
| `/latest` | Show 5 newest jobs | Just send `/latest` |
| `/subscribe` | Subscribe to categories | Select from buttons |
| `/unsubscribe` | Remove subscriptions | Select from list |
| `/help` | Show all commands | Just send `/help` |

---

## Getting Help

- **BotFather Commands**: Type `/help` in BotFather chat
- **Telegram Bot API Docs**: [core.telegram.org/bots/api](https://core.telegram.org/bots/api)
- **Project Repository**: [github.com/tulashvilimindia/batumi.work](https://github.com/tulashvilimindia/batumi.work)
- **Project Issues**: [github.com/tulashvilimindia/batumi.work/issues](https://github.com/tulashvilimindia/batumi.work/issues)

---

*Last updated: January 2026*
