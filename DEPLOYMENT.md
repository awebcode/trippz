# Trippz API Deployment Guide

This guide provides instructions for deploying the Trippz API on a VPS using Docker, Docker Compose, and Nginx.

## Prerequisites

- A VPS with at least 2GB RAM and 2 CPU cores
- Ubuntu 20.04 LTS or later
- Domain name pointing to your VPS
- SSL certificates for your domain

## Initial Server Setup

1. Update your server:
   \`\`\`bash
   sudo apt update && sudo apt upgrade -y
   \`\`\`

2. Install required packages:
   \`\`\`bash
   sudo apt install -y curl git ufw
   \`\`\`

3. Configure firewall:
   \`\`\`bash
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   \`\`\`

## Deployment Steps

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/trippz-api.git
   cd trippz-api
   \`\`\`

2. Create environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Edit the `.env` file with your configuration:
   \`\`\`bash
   nano .env
   \`\`\`

4. Update the Nginx configuration:
   \`\`\`bash
   nano nginx/conf.d/default.conf
   \`\`\`
   Replace `your-domain.com` with your actual domain name.

5. Obtain SSL certificates:
   \`\`\`bash
   sudo apt install -y certbot
   sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
   \`\`\`

6. Copy SSL certificates:
   \`\`\`bash
   mkdir -p nginx/ssl
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
   sudo chmod 644 nginx/ssl/*.pem
   \`\`\`

7. Make deployment scripts executable:
   \`\`\`bash
   chmod +x deploy.sh backup.sh restore.sh
   \`\`\`

8. Run the deployment script:
   \`\`\`bash
   ./deploy.sh
   \`\`\`

## Maintenance

### Backup

To create a backup of your database, environment variables, and logs:

\`\`\`bash
./backup.sh
\`\`\`

Backups will be stored in the `backups` directory. By default, backups older than 30 days are automatically removed.

### Restore

To restore from a backup:

\`\`\`bash
./restore.sh ./backups/trippz_backup_20250426_123456.sql.gz
\`\`\`

### Logs

Docker logs can be viewed with:

\`\`\`bash
docker-compose logs -f
\`\`\`

Application logs are stored in the `logs` directory.

### Updating the Application

To update the application:

1. Pull the latest changes:
   \`\`\`bash
   git pull
   \`\`\`

2. Rebuild and restart the containers:
   \`\`\`bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   \`\`\`

### SSL Certificate Renewal

Let's Encrypt certificates expire after 90 days. To renew them:

1. Stop Nginx:
   \`\`\`bash
   docker-compose stop nginx
   \`\`\`

2. Renew certificates:
   \`\`\`bash
   sudo certbot renew
   \`\`\`

3. Copy new certificates:
   \`\`\`bash
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
   sudo chmod 644 nginx/ssl/*.pem
   \`\`\`

4. Start Nginx:
   \`\`\`bash
   docker-compose start nginx
   \`\`\`

You can automate this process with a cron job.

## Monitoring

Consider setting up monitoring for your application using tools like:

- Prometheus and Grafana for metrics
- ELK Stack for log management
- Uptime Robot for uptime monitoring

## Troubleshooting

### Database Connection Issues

If the API cannot connect to the database:

1. Check if the database container is running:
   \`\`\`bash
   docker-compose ps postgres
   \`\`\`

2. Verify the database connection string in the `.env` file.

3. Check database logs:
   \`\`\`bash
   docker-compose logs postgres
   \`\`\`

### Nginx Configuration Issues

If Nginx is not working correctly:

1. Check Nginx logs:
   \`\`\`bash
   docker-compose logs nginx
   \`\`\`

2. Verify the Nginx configuration:
   \`\`\`bash
   docker-compose exec nginx nginx -t
   \`\`\`

### Application Issues

If the API is not working correctly:

1. Check application logs:
   \`\`\`bash
   docker-compose logs api
   \`\`\`

2. Check for errors in the `logs` directory.

3. Verify environment variables are set correctly.
