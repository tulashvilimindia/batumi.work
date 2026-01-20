# Production Deployment Guide

This guide covers deploying Georgia JobBoard on a Linux VM with Cloudflare.

---

## Table of Contents

1. [Domain & Subdomain Setup](#domain--subdomain-setup)
2. [Cloudflare Configuration](#cloudflare-configuration)
3. [Linux VM Setup](#linux-vm-setup)
4. [Application Deployment](#application-deployment)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Domain & Subdomain Setup

### Required DNS Records

Configure these records in Cloudflare for `batumi.work`:

| Type | Name | Content | Proxy | Purpose |
|------|------|---------|-------|---------|
| A | `@` | `<VM_IP>` | Yes | Main website |
| A | `www` | `<VM_IP>` | Yes | WWW redirect |
| A | `api` | `<VM_IP>` | Yes | API endpoint (optional) |
| CNAME | `bot` | `@` | No | Telegram webhook (if needed) |

### Subdomain Architecture

```
batumi.work/              → Main website (Georgian)
batumi.work/en/           → English version
batumi.work/api/          → API (proxied through nginx)
batumi.work/docs          → API documentation

Optional subdomains:
api.batumi.work           → Direct API access (if needed)
```

### Recommended Setup (Single Domain)

For simplicity, use path-based routing on the main domain:

```
https://batumi.work/                    → Frontend (Georgian)
https://batumi.work/en/                 → Frontend (English)
https://batumi.work/api/v1/             → API endpoints
https://batumi.work/docs                → Swagger UI
https://batumi.work/health              → Health check
https://batumi.work/admin/analytics.html → Analytics dashboard
```

This approach:
- Simplifies SSL certificate management
- Works better with Cloudflare proxy
- Easier to configure and maintain

---

## Cloudflare Configuration

### 1. Add Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Add a Site"
3. Enter `batumi.work`
4. Select a plan (Free works fine)
5. Update nameservers at your registrar

### 2. DNS Settings

After nameservers propagate, add DNS records:

```
Type: A
Name: @
Content: YOUR_VM_IP_ADDRESS
Proxy status: Proxied (orange cloud)
TTL: Auto

Type: A
Name: www
Content: YOUR_VM_IP_ADDRESS
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### 3. SSL/TLS Settings

Navigate to **SSL/TLS** in Cloudflare:

1. **Overview**: Set to "Full (strict)"
2. **Edge Certificates**:
   - Always Use HTTPS: ON
   - Automatic HTTPS Rewrites: ON
   - Minimum TLS Version: TLS 1.2
3. **Origin Server**:
   - Create Origin Certificate (see SSL section below)

### 4. Caching Rules

Navigate to **Caching** → **Configuration**:

- Caching Level: Standard
- Browser Cache TTL: 4 hours

**Page Rules** (optional, 3 free):

| URL Pattern | Setting |
|-------------|---------|
| `*batumi.work/api/*` | Cache Level: Bypass |
| `*batumi.work/*.html` | Cache Level: Standard, Edge TTL: 2 hours |
| `*batumi.work/static/*` | Cache Level: Cache Everything, Edge TTL: 1 month |

### 5. Security Settings

Navigate to **Security**:

1. **WAF**: Enable managed rules (free tier available)
2. **Bot Fight Mode**: ON
3. **Security Level**: Medium

### 6. Speed Settings

Navigate to **Speed** → **Optimization**:

- Auto Minify: HTML, CSS, JavaScript
- Brotli: ON
- Early Hints: ON
- Rocket Loader: OFF (can break JavaScript)

---

## Linux VM Setup

### Requirements

- Ubuntu 22.04 LTS (recommended) or Debian 12
- Minimum: 2 vCPU, 4GB RAM, 40GB SSD
- Recommended: 4 vCPU, 8GB RAM, 80GB SSD

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    curl \
    git \
    ufw \
    fail2ban \
    htop \
    nano

# Create deploy user (optional but recommended)
sudo adduser deploy
sudo usermod -aG sudo deploy
```

### 2. Configure Firewall

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 3. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Log out and back in for group changes to take effect
```

### 4. Configure Fail2ban

```bash
# Create jail configuration
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

```bash
# Restart fail2ban
sudo systemctl restart fail2ban
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Clone the repository
cd /opt
sudo git clone https://github.com/tulashvilimindia/batumi.work.git
sudo chown -R $USER:$USER batumi.work
cd batumi.work/compose-project
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with production values
nano .env
```

**Production .env example:**

```bash
# Database (use strong passwords!)
POSTGRES_USER=jobboard
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
POSTGRES_DB=jobboard

# Security (generate random strings!)
ADMIN_API_KEY=YOUR_RANDOM_API_KEY_32_CHARS
SECRET_KEY=YOUR_RANDOM_SECRET_KEY_64_CHARS

# Environment
DEBUG=false
ENVIRONMENT=production

# Parser
PARSER_INTERVAL_MINUTES=60
ENABLED_SOURCES=jobs.ge
PARSE_REGIONS=all  # "all" for all Georgian regions, or "adjara" for Adjara only

# Telegram Bot (get from @BotFather)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
WEB_URL=https://batumi.work

# Email Reports (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
REPORT_RECIPIENTS=admin@batumi.work
```

**Generate secure passwords:**

```bash
# Generate random password
openssl rand -base64 32

# Generate API key
openssl rand -hex 16

# Generate secret key
openssl rand -hex 32
```

### 3. Build and Start Services

```bash
# Build images
docker compose build

# Start core services
docker compose up -d

# Start with parser and bot
docker compose --profile parser --profile bot up -d

# Or start everything
docker compose --profile full up -d

# Check status
docker compose ps
```

### 4. Initialize Database

```bash
# Run migrations
docker compose exec api alembic upgrade head

# Verify database
docker compose exec db psql -U jobboard -c "\dt"
```

### 5. Verify Deployment

```bash
# Check health endpoint
curl http://localhost/health

# Check detailed health
curl http://localhost/health/detailed

# Check logs
docker compose logs -f
```

---

## SSL/TLS Configuration

### Option 1: Cloudflare Origin Certificate (Recommended)

1. In Cloudflare, go to **SSL/TLS** → **Origin Server**
2. Click "Create Certificate"
3. Keep defaults (RSA 2048, 15 years)
4. Copy the certificate and private key

```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/cloudflare

# Save certificate
sudo nano /etc/ssl/cloudflare/cert.pem
# Paste the certificate

# Save private key
sudo nano /etc/ssl/cloudflare/key.pem
# Paste the private key

# Set permissions
sudo chmod 600 /etc/ssl/cloudflare/key.pem
```

Update nginx configuration in `web/nginx.conf`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name batumi.work www.batumi.work;

    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    # ... rest of config
}
```

Update `docker-compose.yml` to mount certificates:

```yaml
web:
  volumes:
    - ./web/static:/usr/share/nginx/html:ro
    - ./web/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    - /etc/ssl/cloudflare:/etc/ssl/cloudflare:ro
  ports:
    - "80:80"
    - "443:443"
```

### Option 2: Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot

# Stop nginx temporarily
docker compose stop web

# Get certificate
sudo certbot certonly --standalone -d batumi.work -d www.batumi.work

# Certificate location
# /etc/letsencrypt/live/batumi.work/fullchain.pem
# /etc/letsencrypt/live/batumi.work/privkey.pem

# Set up auto-renewal
sudo crontab -e
# Add: 0 0 1 * * certbot renew --quiet && docker compose restart web
```

---

## Post-Deployment Checklist

### Verification

- [ ] Website loads at https://batumi.work
- [ ] API responds at https://batumi.work/api/v1/jobs
- [ ] Health check passes: https://batumi.work/health
- [ ] Georgian pages work: https://batumi.work/ge/
- [ ] English pages work: https://batumi.work/en/
- [ ] SSL certificate valid (check in browser)
- [ ] Cloudflare proxy active (check response headers)

### Security

- [ ] Strong passwords in .env
- [ ] Firewall enabled (UFW)
- [ ] Fail2ban configured
- [ ] SSH key authentication (disable password auth)
- [ ] Database not exposed externally

### Monitoring

- [ ] Set up UptimeRobot or similar
- [ ] Configure Cloudflare notifications
- [ ] Test backup restore procedure

### Performance

- [ ] Cloudflare caching working
- [ ] Lighthouse score > 90
- [ ] API response time < 200ms

---

## Useful Commands

### Docker Management

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f api
docker compose logs -f --tail=100

# Restart services
docker compose restart api

# Rebuild and restart
docker compose build api && docker compose up -d api

# Full restart
docker compose down && docker compose up -d
```

### Updates

```bash
# Pull latest code
cd /opt/batumi.work/compose-project
git pull origin main

# Rebuild and restart
docker compose build
docker compose up -d

# Run migrations if needed
docker compose exec api alembic upgrade head
```

### Backup

```bash
# Manual backup
docker compose exec db pg_dump -U jobboard jobboard | gzip > backup_$(date +%Y%m%d).sql.gz

# Start backup service
docker compose --profile backup up -d
```

### Troubleshooting

```bash
# Check container logs
docker compose logs api --tail=50

# Enter container shell
docker compose exec api /bin/sh

# Check database
docker compose exec db psql -U jobboard

# Check nginx config
docker compose exec web nginx -t

# Restart everything
docker compose down && docker compose --profile full up -d
```

---

## Support

- **GitHub Issues**: [github.com/tulashvilimindia/batumi.work/issues](https://github.com/tulashvilimindia/batumi.work/issues)
- **Documentation**: See `docs/` folder

---

*Last updated: January 2026*
