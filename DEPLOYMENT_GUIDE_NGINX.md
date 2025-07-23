# Complete Deployment Guide: Next.js E-commerce on Ubuntu 25 with Nginx

## Table of Contents
1. [Server Setup](#server-setup)
2. [Domain Configuration](#domain-configuration)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Process Management](#process-management)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites
- Ubuntu 25 server with root access
- Domain name: `anjums.me` pointed to your server IP
- Basic knowledge of Linux command line

## 1. Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git unzip software-properties-common -y
```

### 1.2 Install Node.js 20.x LTS
```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.3 Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

### 1.4 Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5 Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 1.6 Configure Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Domain Configuration

### 2.1 DNS Setup
Ensure your domain `anjums.me` points to your server IP:
- A record: `anjums.me` → `YOUR_SERVER_IP`
- A record: `www.anjums.me` → `YOUR_SERVER_IP`

### 2.2 Verify DNS Propagation
```bash
dig anjums.me
nslookup anjums.me
```

## 3. Database Setup

### 3.1 Create PostgreSQL Database
```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
\q
```

### 3.2 Configure PostgreSQL for Remote Connections
```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Add/modify:
```
listen_addresses = 'localhost'
```

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Add:
```
local   ecommerce_db    ecommerce_user                  md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 4. Application Deployment

### 4.1 Create Application User
```bash
sudo adduser --system --group --home /var/www/anjums-ecommerce anjums
sudo mkdir -p /var/www/anjums-ecommerce
sudo chown anjums:anjums /var/www/anjums-ecommerce
```

### 4.2 Clone and Setup Application
```bash
sudo -u anjums bash
cd /var/www/anjums-ecommerce

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/thsvo/anjums-ecommerce.git .

# Or upload your files via SCP/SFTP
```

### 4.3 Install Dependencies
```bash
npm install
```

### 4.4 Environment Configuration
```bash
nano .env
```

Create your `.env` file:
```env
# Database
DATABASE_URL="postgresql://ecommerce_user:your_secure_password@localhost:5432/ecommerce_db"
DIRECT_URL="postgresql://ecommerce_user:your_secure_password@localhost:5432/ecommerce_db"

# Application
NODE_ENV=production
NEXTAUTH_URL=https://anjums.me
NEXTAUTH_SECRET=your_very_long_random_secret_here

# Server Configuration
SERVER_PORT=3001
NEXT_PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_here

# SSL Commerce (if using)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=true

# ImageBB (if using)
IMAGEBB_API_KEY=your_imagebb_api_key

# Email Configuration (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (if using)
SMS_API_KEY=your_sms_api_key
SMS_SECRET_KEY=your_sms_secret_key

# WhatsApp Business (if using)
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### 4.5 Set Proper Permissions
```bash
chmod 600 .env
```

### 4.6 Database Migration
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4.7 Build Application
```bash
npm run build
```

### 4.8 Create Upload Directory
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

## 5. Nginx Configuration

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/anjums.me
```

Add the following configuration:
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream for Next.js app
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Upstream for Express server
upstream express_upstream {
    server 127.0.0.1:3001;
    keepalive 64;
}

# Redirect www to non-www
server {
    listen 80;
    listen [::]:80;
    server_name www.anjums.me;
    return 301 http://anjums.me$request_uri;
}

# Main server block
server {
    listen 80;
    listen [::]:80;
    server_name anjums.me;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        image/svg+xml;

    # Client upload limit
    client_max_body_size 10M;

    # Serve static files
    location /uploads/ {
        alias /var/www/anjums-ecommerce/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Serve Next.js static files
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API routes to Express server
    location /api/server/ {
        rewrite ^/api/server/(.*)$ /api/$1 break;
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Rate limiting for API
        limit_req zone=api burst=20 nodelay;
    }

    # Special rate limiting for login endpoints
    location ~ ^/api/(auth|login) {
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Strict rate limiting for auth endpoints
        limit_req zone=login burst=3 nodelay;
    }

    # All other requests to Next.js
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5.2 Enable Site and Test Configuration
```bash
sudo ln -s /etc/nginx/sites-available/anjums.me /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Certificate Setup

### 6.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d anjums.me -d www.anjums.me
```

### 6.3 Auto-renewal Setup
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 7. Process Management

### 7.1 Create PM2 Ecosystem File
```bash
sudo -u anjums nano /var/www/anjums-ecommerce/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'anjums-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/anjums-ecommerce',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: '/var/log/pm2/anjums-nextjs.log',
      error_file: '/var/log/pm2/anjums-nextjs-error.log',
      out_file: '/var/log/pm2/anjums-nextjs-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      watch: false,
      ignore_watch: ['node_modules', 'public/uploads', '.git'],
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'anjums-server',
      script: 'server.js',
      cwd: '/var/www/anjums-ecommerce',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        SERVER_PORT: 3001
      },
      log_file: '/var/log/pm2/anjums-server.log',
      error_file: '/var/log/pm2/anjums-server-error.log',
      out_file: '/var/log/pm2/anjums-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      watch: false,
      ignore_watch: ['node_modules', 'public/uploads', '.git'],
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

### 7.2 Setup PM2 Log Directory
```bash
sudo mkdir -p /var/log/pm2
sudo chown anjums:anjums /var/log/pm2
```

### 7.3 Start Applications with PM2
```bash
sudo -u anjums bash
cd /var/www/anjums-ecommerce
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Follow the instructions from `pm2 startup` command (run the generated command as root).

### 7.4 Setup PM2 Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## 8. Monitoring & Maintenance

### 8.1 System Monitoring Script
```bash
sudo nano /usr/local/bin/anjums-monitor.sh
```

```bash
#!/bin/bash

LOG_FILE="/var/log/anjums-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting health check..." >> $LOG_FILE

# Check if PM2 processes are running
if ! sudo -u anjums pm2 status | grep -q "online"; then
    echo "[$DATE] PM2 processes not healthy, restarting..." >> $LOG_FILE
    sudo -u anjums pm2 restart all
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "[$DATE] Nginx not running, starting..." >> $LOG_FILE
    systemctl start nginx
fi

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "[$DATE] PostgreSQL not running, starting..." >> $LOG_FILE
    systemctl start postgresql
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Memory usage is ${MEMORY_USAGE}%" >> $LOG_FILE
fi

echo "[$DATE] Health check completed." >> $LOG_FILE
```

```bash
sudo chmod +x /usr/local/bin/anjums-monitor.sh
```

### 8.2 Setup Monitoring Cron Job
```bash
sudo crontab -e
```

Add:
```cron
# Run health check every 5 minutes
*/5 * * * * /usr/local/bin/anjums-monitor.sh

# Clean old logs weekly
0 2 * * 0 find /var/log/pm2 -name "*.log" -type f -mtime +30 -delete
0 2 * * 0 find /var/log -name "anjums-monitor.log" -type f -size +100M -delete
```

### 8.3 Backup Script
```bash
sudo nano /usr/local/bin/anjums-backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/anjums-ecommerce"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/anjums-ecommerce"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump ecommerce_db > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup (excluding node_modules)
tar --exclude='node_modules' --exclude='.git' --exclude='public/uploads' \
    -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www anjums-ecommerce

# Uploads backup
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $APP_DIR public/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -type f -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /usr/local/bin/anjums-backup.sh
```

### 8.4 Setup Backup Cron Job
```bash
sudo crontab -e
```

Add:
```cron
# Daily backup at 3 AM
0 3 * * * /usr/local/bin/anjums-backup.sh >> /var/log/anjums-backup.log 2>&1
```

## 9. Deployment Script

### 9.1 Create Deployment Script
```bash
sudo nano /usr/local/bin/anjums-deploy.sh
```

```bash
#!/bin/bash

APP_DIR="/var/www/anjums-ecommerce"
BACKUP_DIR="/var/backups/anjums-ecommerce"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment process..."

# Switch to app user
sudo -u anjums bash << 'EOF'
cd /var/www/anjums-ecommerce

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install/update dependencies
echo "Installing dependencies..."
npm ci --production

# Run database migrations
echo "Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# Build application
echo "Building application..."
npm run build

# Restart PM2 processes
echo "Restarting applications..."
pm2 restart all

echo "Deployment completed successfully!"
EOF

# Test if deployment was successful
sleep 10
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Deployment successful - Application is healthy"
else
    echo "❌ Deployment failed - Application is not responding"
    exit 1
fi
```

```bash
sudo chmod +x /usr/local/bin/anjums-deploy.sh
```

## 10. Security Hardening

### 10.1 Configure Fail2Ban
```bash
sudo apt install fail2ban -y
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.2 Configure Automatic Updates
```bash
sudo apt install unattended-upgrades -y
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Enable automatic security updates.

## 11. Troubleshooting

### 11.1 Common Commands
```bash
# Check PM2 processes
sudo -u anjums pm2 status
sudo -u anjums pm2 logs

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/pm2/anjums-nextjs.log
sudo tail -f /var/log/pm2/anjums-server.log

# Check database connection
sudo -u postgres psql -d ecommerce_db -c "SELECT version();"

# Check ports
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 11.2 Performance Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor PM2 processes
sudo -u anjums pm2 monit

# Check application metrics
curl http://localhost:3000/api/health
curl http://localhost:3001/api/health
```

### 11.3 SSL Certificate Issues
```bash
# Check SSL certificate
sudo certbot certificates

# Renew SSL certificate manually
sudo certbot renew --dry-run
sudo certbot renew

# Check SSL configuration
openssl s_client -connect anjums.me:443
```

## 12. Final Verification

### 12.1 Test Your Deployment
1. Visit `https://anjums.me` - Should load your homepage
2. Test user registration/login functionality
3. Test product browsing and cart functionality
4. Test admin panel access
5. Check SSL certificate is valid
6. Verify all API endpoints are working

### 12.2 Performance Testing
```bash
# Install Apache Bench for basic load testing
sudo apt install apache2-utils -y

# Test homepage performance
ab -n 100 -c 10 https://anjums.me/

# Test API performance
ab -n 50 -c 5 https://anjums.me/api/products
```

## 13. Maintenance Checklist

### Daily
- [ ] Check PM2 process status
- [ ] Monitor error logs
- [ ] Check disk space usage

### Weekly
- [ ] Review access logs
- [ ] Check SSL certificate status
- [ ] Review system resource usage
- [ ] Check backup integrity

### Monthly
- [ ] Update system packages
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Performance optimization review

## Support & Resources

- **Logs Location**: `/var/log/pm2/`, `/var/log/nginx/`
- **App Location**: `/var/www/anjums-ecommerce`
- **Backups Location**: `/var/backups/anjums-ecommerce`
- **Nginx Config**: `/etc/nginx/sites-available/anjums.me`
- **PM2 Config**: `/var/www/anjums-ecommerce/ecosystem.config.js`

---

**🎉 Congratulations!** Your Next.js e-commerce application is now deployed on Ubuntu 25 with Nginx at `https://anjums.me`

For any issues or questions, refer to the troubleshooting section or check the application logs.
