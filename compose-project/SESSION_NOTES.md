# Session Notes - batumi.work

**Last Updated:** January 19, 2026
**Status:** Ready for server deployment

---

## Project Overview

Georgia JobBoard (batumi.work) - A bilingual job posting website for Georgia.

**Repository:** https://github.com/tulashvilimindia/batumi.work
**Live URL:** https://batumi.work (not deployed yet)

---

## What's Been Completed

### Application Features (100% Complete)

- [x] FastAPI backend with PostgreSQL
- [x] Static frontend (Georgian/English)
- [x] Job parser (jobs.ge adapter)
- [x] Telegram bot with subscriptions
- [x] Analytics dashboard
- [x] PWA support (manifest, service worker, offline page)
- [x] Automated backups
- [x] Docker Compose setup
- [x] Comprehensive documentation

### Documentation (100% Complete)

| Document | Purpose |
|----------|---------|
| README.md | Project overview, quick start |
| docs/DEPLOYMENT.md | General deployment guide |
| docs/SERVER_DEPLOYMENT_PLAN.md | **Specific plan for 38.242.143.10** |
| docs/ADMIN_GUIDE.md | API and admin operations |
| docs/DEVOPS_GUIDE.md | Container management |
| docs/TELEGRAM_BOT_SETUP.md | Bot creation guide |
| docs/BACKUP_RESTORE.md | Backup procedures |
| docs/USER_GUIDE.md | End-user documentation |

---

## Next Steps: Server Deployment

The application needs to be deployed to the Linux VM.

### Target Server

- **IP:** 38.242.143.10
- **SSH:** `ssh root@38.242.143.10` (passwordless configured)
- **OS:** Ubuntu (Linux 6.8.0)

### Server Constraints

This is a **SHARED SERVER** with existing services:
- batumi.zone (WordPress)
- Plausible Analytics
- Other services on various ports

**CRITICAL:** Do not modify existing nginx configs or services.

### Reserved Ports for batumi.work

| Port | Service |
|------|---------|
| 8100 | Web (nginx) |
| 8101 | API (FastAPI) |
| 8102 | Internal use |

### Deployment Location

```
/opt/batumi-work/compose-project/
```

---

## Deployment Instructions

**Full deployment guide:** `docs/SERVER_DEPLOYMENT_PLAN.md`

### Quick Summary

1. SSH to server
2. Create `/opt/batumi-work`
3. Clone repository
4. Create `docker-compose.override.yml` for production ports
5. Configure `.env` with secure credentials
6. Create nginx virtual host
7. Get SSL certificate (Let's Encrypt or Cloudflare)
8. Start Docker containers
9. Verify deployment

### Key Files to Create on Server

1. `/opt/batumi-work/compose-project/docker-compose.override.yml` - Port overrides
2. `/opt/batumi-work/compose-project/.env` - Environment variables
3. `/etc/nginx/sites-available/batumi.work` - Nginx config

---

## Important Notes

### SSL Certificate Options

**Option A: Let's Encrypt**
- Point DNS directly to server (38.242.143.10)
- Run: `certbot certonly --nginx -d batumi.work -d www.batumi.work`

**Option B: Cloudflare Origin Certificate**
- Use Cloudflare proxy
- Generate Origin Certificate in Cloudflare dashboard
- Save to `/etc/ssl/cloudflare/`

### Telegram Bot

- Token needs to be obtained from @BotFather
- See `docs/TELEGRAM_BOT_SETUP.md` for step-by-step guide
- Add token to `.env` as `TELEGRAM_BOT_TOKEN`

### Database

- Uses PostgreSQL in Docker container
- Port 5432 internal only (not exposed)
- Credentials in `.env` file

---

## Files Changed in This Session

1. `README.md` - Added repo URL, clone instructions
2. `docs/DEPLOYMENT.md` - Created comprehensive deployment guide
3. `docs/SERVER_DEPLOYMENT_PLAN.md` - **Created specific server deployment plan**
4. `docs/DEVOPS_GUIDE.md` - Updated GitHub URL
5. `docs/TELEGRAM_BOT_SETUP.md` - Added repo link
6. `docs/ADMIN_GUIDE.md` - Added Telegram Bot and Scheduled Reports sections
7. `SESSION_NOTES.md` - This file

---

## For Next Agent

### If Deploying to Server

1. Read `docs/SERVER_DEPLOYMENT_PLAN.md` first
2. SSH: `ssh root@38.242.143.10`
3. Follow the step-by-step deployment checklist
4. **Test nginx config before reloading: `nginx -t`**
5. **Do not modify existing services**

### If Making Code Changes

1. Make changes locally
2. Test with `docker compose up`
3. Commit and push to GitHub
4. Deploy to server: `git pull && docker compose build && docker compose up -d`

---

## Git Status

```
Branch: main
Remote: https://github.com/tulashvilimindia/batumi.work.git
Status: Up to date with origin
```

All documentation changes committed and pushed.

---

*Session ended: January 19, 2026*
