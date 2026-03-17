# Deployment Guide

This guide covers deploying ANT AGENT to various environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Docker**: >= 20.10.0 (for containerized deployment)
- **Solana CLI**: >= 1.17.0

### Required Accounts

- Solana wallet with SOL for transactions
- OpenClaw API key
- RPC endpoint access (Helius, QuickNode, or similar)

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/ant-agent/ant-agent.git
cd ant-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run Development Server

```bash
# Development mode with hot reload
npm run dev

# Or run the agent directly
npm start
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

---

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t ant-agent:latest .
```

### 2. Run Container

```bash
docker run -d \
  --name ant-agent \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  ant-agent:latest
```

### 3. Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f ant-agent

# Stop all services
docker-compose down
```

### 4. Verify Deployment

```bash
# Check container status
docker ps

# Health check
curl http://localhost:3000/health
```

---

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace ant-agent
```

### 2. Create Secrets

```bash
kubectl create secret generic ant-agent-secrets \
  --from-literal=solana-rpc-url=$SOLANA_RPC_URL \
  --from-literal=openclaw-api-key=$OPENCLAW_API_KEY \
  --from-literal=wallet-private-key=$WALLET_PRIVATE_KEY \
  -n ant-agent
```

### 3. Apply Configuration

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n ant-agent

# Check services
kubectl get svc -n ant-agent

# View logs
kubectl logs -f deployment/ant-agent -n ant-agent
```

---

## Cloud Deployment

### AWS Deployment

#### Using ECS

```bash
# Create ECR repository
aws ecr create-repository --repository-name ant-agent

# Build and push image
docker build -t ant-agent .
docker tag ant-agent:latest <account>.dkr.ecr.<region>.amazonaws.com/ant-agent:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/ant-agent:latest

# Deploy to ECS
aws ecs create-service --cluster ant-agent --service-name ant-agent-service ...
```

#### Using EC2

```bash
# SSH into EC2 instance
ssh -i key.pem ec2-user@<instance-ip>

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Deploy
docker-compose up -d
```

### GCP Deployment

#### Using GKE

```bash
# Create GKE cluster
gcloud container clusters create ant-agent-cluster --num-nodes=3

# Configure kubectl
gcloud container clusters get-credentials ant-agent-cluster

# Deploy
kubectl apply -f k8s/
```

#### Using Cloud Run

```bash
# Build and deploy
gcloud run deploy ant-agent \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### Using AKS

```bash
# Create AKS cluster
az aks create --resource-group ant-agent --name ant-agent-cluster --node-count 3

# Deploy
kubectl apply -f k8s/
```

---

## Environment Configuration

### Production Environment Variables

```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_COMMITMENT=finalized

# OpenClaw Configuration
OPENCLAW_API_KEY=your_production_api_key
OPENCLAW_COLONY=ant-agent-production

# Trading Configuration
MAX_SLIPPAGE=2.0
MAX_POSITION_SIZE=5000
DAILY_LOSS_LIMIT=1000

# Security
WALLET_PRIVATE_KEY=<encrypted_key>

# Logging
LOG_LEVEL=warn
LOG_FILE=/var/log/ant-agent/agent.log
```

### Security Best Practices

1. **Never commit .env files**
2. **Use secrets management** (AWS Secrets Manager, GCP Secret Manager)
3. **Encrypt sensitive data** at rest and in transit
4. **Use IAM roles** instead of hardcoded credentials
5. **Enable audit logging** for all operations

---

## Monitoring & Logging

### Prometheus Metrics

ANT AGENT exposes the following metrics:

- `ant_agent_colony_status`: Colony running state
- `ant_agent_active_agents`: Number of active agents
- `ant_agent_total_trades`: Total trades executed
- `ant_agent_total_pnl`: Total profit/loss
- `ant_agent_win_rate`: Current win rate
- `ant_agent_signal_count`: Signals detected
- `ant_agent_execution_latency`: Trade execution latency

### Grafana Dashboard

Import the provided Grafana dashboard:

```bash
# Access Grafana
open http://localhost:3001

# Login (default: admin/admin)
# Import dashboard from monitoring/grafana/dashboards/ant-agent.json
```

### Log Aggregation

```bash
# View logs (Docker)
docker-compose logs -f ant-agent

# View logs (Kubernetes)
kubectl logs -f deployment/ant-agent -n ant-agent

# Export logs
docker-compose logs ant-agent > agent.log
```

---

## Troubleshooting

### Common Issues

#### Agent Not Starting

```bash
# Check logs
docker-compose logs ant-agent

# Verify environment variables
docker-compose exec ant-agent env

# Test Solana connection
docker-compose exec ant-agent node -e "console.log(require('./dist').testConnection())"
```

#### High Latency

1. Check RPC endpoint health
2. Increase priority fees
3. Verify network connectivity
4. Check system resources

#### Memory Issues

```bash
# Increase memory limit in docker-compose.yml
services:
  ant-agent:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Getting Help

- 📖 Documentation: https://docs.antagent.io
- 💬 Discord: https://discord.gg/antagent
- 🐛 Issues: https://github.com/ant-agent/ant-agent/issues

---

<div align="center">

**🐜 ANT AGENT - Deployment Guide**

For more information, visit [antagent.io](https://antagent.io)

</div>
