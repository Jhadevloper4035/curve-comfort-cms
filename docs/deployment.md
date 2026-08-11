# Deployment Guide — crm.curve-comfort.com on Amazon EC2

## Architecture Overview

Frontend (nginx:8080) + Backend (Node:8000) sit behind an Nginx reverse proxy that handles domain routing and SSL termination.

```
Internet → EC2:443 → Nginx Reverse Proxy → frontend (port 8080)
                                          → backend  (port 8000)  /api/*
```

---

## Step 1: Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. **AMI**: Ubuntu 24.04 LTS
3. **Instance type**: `t3.small` (minimum) or `t3.medium` recommended
4. **Key pair**: Create/select one and download the `.pem` file
5. **Security Group** — open these ports:

   | Port | Protocol | Source    |
   | ---- | -------- | --------- |
   | 22   | TCP      | Your IP   |
   | 80   | TCP      | 0.0.0.0/0 |
   | 443  | TCP      | 0.0.0.0/0 |

6. **Storage**: 20 GB minimum
7. Launch and note the **Public IPv4** address

---

## Step 2: Point Domain DNS to EC2

In your DNS provider (where `curvecomfort.com` is managed — GoDaddy, Namecheap, Route 53, etc.):

1. Add an **A record**:
   - **Name**: `crm`
   - **Value**: `<your-EC2-public-IP>`
   - **TTL**: 300

Wait 5–10 minutes for propagation, then verify:

```bash
nslookup crm.curve-comfort.com
```

---

## Step 3: SSH into EC2 and Install Docker

```bash
# Connect
ssh -i your-key.pem ubuntu@<EC2-public-IP>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose plugin (v2)
sudo apt install docker-compose-plugin -y

# Install make
sudo apt install make -y

# Verify
docker --version
docker compose version
```

---

## Step 4: Add Nginx Reverse Proxy + SSL to Compose

### 4a. Update `docker-compose.prod.yml`

Replace the current file with:

```yaml
name: curve_comfort-prod

services:
  backend:
    container_name: curve_comfort-backend-prod
    build:
      context: ./backend
      target: production
    restart: always
    env_file:
      - ./backend/.env.production
    environment:
      NODE_ENV: production
    expose:
      - "8000" # internal only — nginx proxies to this

  frontend:
    container_name: curve_comfort-frontend-prod
    build:
      context: ./frontend
      target: production
    restart: always
    env_file:
      - ./frontend/.env
    expose:
      - "8080" # internal only — nginx proxies to this

  nginx:
    image: nginx:alpine
    container_name: curve_comfort-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
```

### 4b. Create `nginx/nginx.conf`

```bash
mkdir -p nginx
```

Create `nginx/nginx.conf`:

```nginx
events {}

http {
    # Redirect HTTP → HTTPS
    server {
        listen 80;
        server_name crm.curve-comfort.com;

        # Certbot ACME challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl;
        server_name crm.curve-comfort.com;

        ssl_certificate     /etc/letsencrypt/live/crm.curve-comfort.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/crm.curve-comfort.com/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;

        # Frontend
        location / {
            proxy_pass         http://frontend:8080;
            proxy_set_header   Host              $host;
            proxy_set_header   X-Real-IP         $remote_addr;
            proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }

        # Backend API — adjust prefix to match your routes
        location /api/ {
            proxy_pass         http://backend:8000;
            proxy_set_header   Host              $host;
            proxy_set_header   X-Real-IP         $remote_addr;
            proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## Step 5: Obtain SSL Certificate (Let's Encrypt)

Run this **before** starting the full stack (DNS must already be pointing to EC2):

```bash
mkdir -p certbot/conf certbot/www

docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d crm.curve-comfort.com \
  --email navrojjha21@gmail.com \
  --agree-tos \
  --no-eff-email
```

---

## Step 6: Deploy the Application

```bash
# Clone the repo on EC2
git clone <your-repo-url> /opt/admindashboard
cd /opt/admindashboard

# Create production env file for backend
cp backend/.env.development backend/.env.production
nano backend/.env.production   # fill in production values

# Update frontend API URL
# The frontend uses the same-origin /api proxy; no frontend API URL is required.

# Build and start all services
make prod
# or: docker compose -f docker-compose.prod.yml up --build -d

# Tail logs
make prod-logs
```

---

## Step 7: Auto-Renew SSL Certificate

Add a cron job on the EC2 instance:

```bash
crontab -e
```

Add this line:

```cron
0 3 * * * docker run --rm \
  -v /opt/admindashboard/certbot/conf:/etc/letsencrypt \
  -v /opt/admindashboard/certbot/www:/var/www/certbot \
  certbot/certbot renew --webroot -w /var/www/certbot \
  && docker exec curve_comfort-nginx nginx -s reload
```

---

## Deployment Checklist

- [ ] EC2 launched (Ubuntu 24.04, t3.small or larger)
- [ ] Security group: ports 22, 80, 443 open
- [ ] DNS A record: `crm` → EC2 public IP
- [ ] Docker, Docker Compose plugin, and make installed on EC2
- [ ] `nginx/nginx.conf` created
- [ ] `docker-compose.prod.yml` updated with nginx + certbot services
- [ ] SSL certificate obtained via certbot (port 80 must be free)
- [ ] `backend/.env.production` configured with production values
- [ ] `ALLOWED_ORIGINS=https://crm.curve-comfort.com` configured in the backend environment
- [ ] `make prod` running and healthy
- [ ] SSL auto-renewal cron configured

---

## Useful Commands on EC2

```bash
# Check running containers
make prod-ps

# View logs
make prod-logs

# Restart all services
make prod-down && make prod

# Reload nginx config without downtime
docker exec curve_comfort-nginx nginx -s reload

# Check SSL certificate expiry
docker exec curve_comfort-nginx nginx -t
openssl s_client -connect crm.curve-comfort.com:443 -servername crm.curve-comfort.com 2>/dev/null | openssl x509 -noout -dates
```
