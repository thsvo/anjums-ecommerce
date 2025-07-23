# Deployment Guide: Next.js App with Nginx on Ubuntu

This guide provides step-by-step instructions for deploying your Next.js application with a custom Express server and Prisma on an Ubuntu server using Nginx as a reverse proxy.

**Domain:** `anjums.me`

## 1. Server Setup

### 1.1. Initial Server Configuration

1.  **Connect to your server:**
    ```bash
    ssh root@YOUR_SERVER_IP
    ```

2.  **Create a new user:**
    ```bash
    adduser your_username
    usermod -aG sudo your_username
    su - your_username
    ```

3.  **Update your server:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

### 1.2. Install Node.js and npm

1.  **Install Node.js (v20.x recommended):**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

2.  **Verify installation:**
    ```bash
    node -v
    npm -v
    ```

### 1.3. Install Database (PostgreSQL Example)

Prisma supports multiple databases. This example uses PostgreSQL.

1.  **Install PostgreSQL:**
    ```bash
    sudo apt install postgresql postgresql-contrib -y
    ```

2.  **Create a database and user:**
    ```bash
    sudo -u postgres psql
    ```
    Inside the psql shell:
    ```sql
    CREATE DATABASE myappdb;
    CREATE USER myappuser WITH ENCRYPTED PASSWORD 'your_password';
    GRANT ALL PRIVILEGES ON DATABASE myappdb TO myappuser;
    \q
    ```

### 1.4. Install Nginx

1.  **Install Nginx:**
    ```bash
    sudo apt install nginx -y
    ```

2.  **Adjust the firewall:**
    ```bash
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 'OpenSSH'
    sudo ufw enable
    ```

## 2. Application Setup

### 2.1. Clone Your Repository

1.  **Clone the project:**
    ```bash
    git clone https://github.com/thsvo/anjums-ecommerce.git
    cd anjums-ecommerce
    ```

### 2.2. Install Dependencies

1.  **Install project dependencies:**
    ```bash
    npm install
    ```

### 2.3. Configure Environment Variables

1.  **Create a `.env` file:**
    ```bash
    cp .env.example .env
    ```
    If you don't have an `.env.example`, create a new `.env` file:
    ```bash
    nano .env
    ```

2.  **Add your environment variables.** Make sure to include:
    -   `DATABASE_URL`: The connection string for your database (e.g., `postgresql://myappuser:your_password@localhost:5432/myappdb`).
    -   `NEXT_PUBLIC_API_URL`: The URL of your backend (e.g., `https://anjums.me/api`).
    -   `JWT_SECRET`: A secure secret key for JWT tokens (e.g., `your-super-secret-jwt-key-here`).
    -   `SERVER_PORT`: Set to `3000` for production to match Nginx configuration.
    -   `NODE_ENV`: Set to `production`.
    -   `NEXTAUTH_URL`: Your domain URL (e.g., `https://anjums.me`).
    -   Any SSLCommerz, SMS, or WhatsApp API keys your application needs.

### 2.4. Set Up the Database with Prisma

1.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```

2.  **Run database migrations:**
    ```bash
    npx prisma migrate deploy
    ```

### 2.5. Build the Application

1.  **Build your Next.js app:**
    ```bash
    npm run build
    ```

## 3. Run the Application with PM2

PM2 is a process manager that will keep your application running in the background.

1.  **Install PM2:**
    ```bash
    sudo npm install pm2 -g
    ```

2.  **Start your application:**
    Your `package.json` has a `server.js` file, which is a unified server that serves both API and Next.js.
    ```bash
    # Set the correct port for production (should match Nginx proxy)
    export SERVER_PORT=3000
    pm2 start server.js --name anjums-ecommerce
    ```
    
    **Important**: The `server.js` file serves both the API routes and Next.js app on the same port.
    Make sure `SERVER_PORT` is set to 3000 to match your Nginx configuration.

3.  **Enable PM2 to start on boot:**
    ```bash
    pm2 startup
    ```
    (Follow the on-screen instructions)
    ```bash
    pm2 save
    ```

4.  **Viewing Logs:**
    To monitor your application and check for errors, you can view the logs:
    ```bash
    pm2 logs anjums-ecommerce
    ```

## 4. Configure Nginx as a Reverse Proxy

1.  **Create a new Nginx configuration file:**
    ```bash
    sudo nano /etc/nginx/sites-available/anjums.me
    ```

2.  **Add the following configuration.** This will forward requests to your application running on port 3000.

    ```nginx
    server {
        listen 80;
        server_name anjums.me www.anjums.me;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable the site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/anjums.me /etc/nginx/sites-enabled/
    ```

4.  **Test the Nginx configuration:**
    ```bash
    sudo nginx -t
    ```

5.  **Restart Nginx:**
    ```bash
    sudo systemctl restart nginx
    ```

At this point, your application should be accessible at `http://anjums.me`.

## 5. Secure Your Site with SSL (Let's Encrypt)

1.  **Install Certbot:**
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```

2.  **Obtain an SSL certificate:**
    ```bash
    sudo certbot --nginx -d anjums.me -d www.anjums.me
    ```
    Certbot will automatically update your Nginx configuration to handle SSL and redirect HTTP to HTTPS.

3.  **Verify auto-renewal:**
    Certbot sets up a cron job for automatic renewal. You can test it with:
    ```bash
    sudo certbot renew --dry-run
    ```

Your application is now deployed and accessible at `https://anjums.me`.
