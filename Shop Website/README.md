# MystiKraft Shop Website

A modern e-commerce website built with Node.js, Express, MongoDB, and Materialize CSS.

## Setup Instructions

1. Install dependencies: `npm install`
2. Seed the database: `npm run seed`
3. Start the server: `npm start`

## Docker Instructions

### Prerequisites
- Docker Desktop installed and running
- Node.js and npm installed

### Building the Docker Image
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Build the Docker image
docker build -t mystikraft .
```

### Running the Container
```bash
# Run the container on port 5001
docker run -d -p 5001:3000 --name mystikraft-app mystikraft

# Check container status
docker ps
```

### Accessing the Application
- **Main Application**: http://localhost:5001
- **Shop Page**: http://localhost:5001/shop.html
- **Student API Endpoint**: http://localhost:5001/api/student

### Expected /api/student Output
```json
{
    "name": "KRISHNA CHAUDHARI",
    "studentId": "S223751702"
}
```

### Container Management
```bash
# View logs
docker logs mystikraft-app

# Stop container
docker stop mystikraft-app

# Start stopped container
docker start mystikraft-app

# Remove container
docker rm mystikraft-app
```

### Troubleshooting
- If port 5001 is occupied, try port 5002: `docker run -d -p 5002:3000 --name mystikraft-app mystikraft`
- Check logs if container doesn't start: `docker logs mystikraft-app`
- Ensure local development server is not running when testing Docker version

## Technology Stack
- 🟢 Node.js
- 🟡 Vanilla JavaScript
- 🔵 HTML & CSS, Materialize
- 🟣 MongoDB
- 🐳 Docker
