#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  rm get-docker.sh
  echo "Docker installed successfully"
fi

if ! command -v docker-compose &> /dev/null; then
  echo "Docker Compose is not installed. Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo "Docker Compose installed successfully"
fi

# Create necessary directories
mkdir -p nginx/conf.d nginx/ssl nginx/logs logs

# Check if SSL certificates exist
if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
  echo "SSL certificates not found. Please place your SSL certificates in the nginx/ssl directory."
  echo "You can use Let's Encrypt to generate free SSL certificates."
  echo "Example: sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com"
  echo "Then copy the certificates to the nginx/ssl directory:"
  echo "sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/"
  echo "sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/"
  echo "sudo chmod 644 nginx/ssl/*.pem"
  exit 1
fi

# Build and start the containers
echo "Building and starting containers..."
docker-compose build
docker-compose up -d

echo "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Exit"; then
  echo "Error: Some services failed to start. Check the logs with 'docker-compose logs'"
  exit 1
fi

echo "Deployment completed successfully!"
echo "Your application is now running at https://your-domain.com"
