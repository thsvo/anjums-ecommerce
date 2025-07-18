# Deployment Guide for anjums.me

This guide provides step-by-step instructions for deploying your Next.js and Express application on a server with Nginx.

---

### Part 1: Prepare Your Application on the Server

First, you need to get your application code onto your server (e.g., via `git clone`). Once the code is there, follow these steps in your project directory.

**1. Install Dependencies:**
```bash
npm install
```

**2. Build the Next.js Application:**
This command creates an optimized production build in the `.next` folder.
```bash
npm run build
```

**3. Install a Process Manager (PM2):**
PM2 is a production process manager for Node.js applications that will keep your site alive.
```bash
npm install pm2 -g
```

**4. Start Your Application with PM2:**
This command will start both your Next.js development server and your Express server using `pm2`.

**Note:** Using `next dev` and `nodemon` is not recommended for production environments. For production, you should use `npm run build` and `pm2 start server.js`.

To start the servers as you requested, you can use the following commands:

```bash
pm2 start "npm run server" --name anjums-server
pm2 start "npm run start" --name anjums-client
```

You can check the status of your apps with `pm2 list` or view logs with `pm2 logs anjums-server` and `pm2 logs anjums-client`. Your app is now running on `http://localhost:3000` and the server on `http://localhost:3001`.

---

### Part 2: Configure Nginx

Now, we will configure Nginx to act as a reverse proxy, directing traffic from `anjums.me` to your application.

**1. Create an Nginx Configuration File:**
Create a new file in `/etc/nginx/sites-available/`:
```bash
sudo nano /etc/nginx/sites-available/anjums.me
```

**2. Add the Following Configuration:**
Copy and paste the entire block below into the file you just created. This configuration tells Nginx how to handle requests for your domain.

```nginx
# /etc/nginx/sites-available/anjums.me

# Redirect www to non-www (optional but recommended)
server {
    listen 80;
    listen [::]:80;
    server_name www.anjums.me;
    return 301 http://anjums.me$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    server_name anjums.me;

    # Increase max body size for file uploads if needed
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**3. Enable the Configuration:**
Create a symbolic link from `sites-available` to `sites-enabled` to activate your configuration.
```bash
sudo ln -s /etc/nginx/sites-available/anjums.me /etc/nginx/sites-enabled/
```

**4. Test Nginx Configuration:**
Make sure there are no syntax errors.
```bash
sudo nginx -t
```

If it reports `syntax is ok` and `test is successful`, you are ready to proceed.

---

### Part 3: Final Step

**Reload Nginx to Apply All Changes:**
```bash
sudo systemctl reload nginx
```

Your application should now be live and accessible at **http://anjums.me**.
