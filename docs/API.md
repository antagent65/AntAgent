# API Documentation

ANT AGENT REST API Reference

---

## Base URL

```
Production: https://api.antagent.io
Development: http://localhost:3000
```

## Authentication

All API requests require authentication using Bearer tokens.

```bash
Authorization: Bearer <your_api_key>
```

---

## Endpoints

### Colony Management

#### Get Colony Status

```http
GET /api/v1/colony/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "activeAgents": 4,
    "agentsByType": {
      "scout": 1,
      "analyst": 1,
      "executor": 1,
      "learning": 1
    },
    "totalTrades": 142,
    "totalPnl": 2450.00,
    "uptime": 86400,
    "lastUpdate": 1710000000000
  }
}
```

#### Start Colony

```http
POST /api/v1/colony/start
```

**Response:**

```json
{
  "success": true,
  "message": "Colony started successfully"
}
```

#### Stop Colony

```http
POST /api/v1/colony/stop
```

**Response:**

```json
{
  "success": true,
  "message": "Colony stopped successfully"
}
```

#### Pause Colony

```http
POST /api/v1/colony/pause
```

#### Resume Colony

```http
POST /api/v1/colony/resume
```

---

### Agent Management

#### List Agents

```http
GET /api/v1/agents
```

**Response:**

```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "Scout-001",
        "type": "scout",
        "status": "running",
        "executionCount": 1420,
        "errorCount": 2,
        "uptime": 86400000,
        "lastExecution": 1710000000000
      },
      {
        "id": "Analyst-001",
        "type": "analyst",
        "status": "running",
        "executionCount": 480,
        "errorCount": 0,
        "uptime": 86400000,
        "lastExecution": 1710000000000
      }
    ]
  }
}
```

#### Deploy Agent

```http
POST /api/v1/agents/deploy
Content-Type: application/json

{
  "type": "scout",
  "config": {
    "name": "Scout-002",
    "options": {
      "targets": ["new_pools", "whale_alerts"],
      "updateInterval": 1000,
      "signalThreshold": 0.7
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "agentId": "Scout-002",
    "status": "initialized"
  }
}
```

#### Get Agent Stats

```http
GET /api/v1/agents/:agentId/stats
```

#### Remove Agent

```http
DELETE /api/v1/agents/:agentId
```

---

### Trading

#### Get Trades

```http
GET /api/v1/trades?limit=50&offset=0
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Number of trades to return |
| offset | number | 0 | Pagination offset |
| status | string | all | Filter by status |
| pair | string | all | Filter by trading pair |

**Response:**

```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "trade-1710000000-abc123",
        "pair": "SOL/USDC",
        "type": "buy",
        "amount": 1000,
        "price": 105.50,
        "slippage": 0.5,
        "signature": "5xKjH...abc123",
        "status": "completed",
        "timestamp": 1710000000000,
        "pnl": 125.00,
        "agent": "Executor-001"
      }
    ],
    "total": 142,
    "limit": 50,
    "offset": 0
  }
}
```

#### Get Trade Details

```http
GET /api/v1/trades/:tradeId
```

---

### Performance

#### Get Metrics

```http
GET /api/v1/metrics?window=24h
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| window | string | 24h | Time window (24h, 7d, 30d, all) |

**Response:**

```json
{
  "success": true,
  "data": {
    "totalPnl": 2450.00,
    "winRate": 68.5,
    "totalTrades": 142,
    "avgTradeSize": 850,
    "bestAgent": "Executor-001",
    "worstAgent": "Executor-002",
    "window": "24h",
    "timestamp": 1710000000000
  }
}
```

#### Get Performance Chart

```http
GET /api/v1/performance/chart?resolution=1h
```

---

### Signals

#### Get Recent Signals

```http
GET /api/v1/signals?limit=100
```

**Response:**

```json
{
  "success": true,
  "data": {
    "signals": [
      {
        "id": "pool-scout-001-1710000000-xyz",
        "type": "new_pool",
        "strength": 0.85,
        "timestamp": 1710000000000,
        "source": "Scout-001",
        "data": {
          "pair": "NEW/USDC",
          "liquidity": 50000,
          "volume24h": 25000
        },
        "validated": true
      }
    ]
  }
}
```

---

### Settings

#### Get Settings

```http
GET /api/v1/settings
```

#### Update Settings

```http
PUT /api/v1/settings
Content-Type: application/json

{
  "trading": {
    "maxSlippage": 2.5,
    "maxPositionSize": 1000,
    "stopLoss": 5,
    "takeProfit": 10
  }
}
```

---

### WebSocket API

Real-time updates via WebSocket.

```javascript
const ws = new WebSocket('wss://api.antagent.io/ws');

ws.onopen = () => {
  // Subscribe to channels
  ws.send(JSON.stringify({
    action: 'subscribe',
    channels: ['trades', 'signals', 'metrics']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

**Available Channels:**

- `trades` - Real-time trade notifications
- `signals` - New signal alerts
- `metrics` - Performance metric updates
- `agents` - Agent status changes

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent with ID 'Scout-999' not found",
    "details": {
      "agentId": "Scout-999"
    }
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| `AGENT_NOT_FOUND` | Specified agent does not exist |
| `AGENT_LIMIT_REACHED` | Maximum agents of this type deployed |
| `INVALID_CONFIG` | Configuration validation failed |
| `INSUFFICIENT_BALANCE` | Wallet balance too low |
| `TRADE_FAILED` | Trade execution failed |
| `RATE_LIMITED` | Too many requests |

---

## Rate Limits

| Tier | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Elite | 1,000 | 100,000 |
| Institutional | Unlimited | Unlimited |

Rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1710000060
```

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @ant-agent/sdk
```

```typescript
import { AntAgentClient } from '@ant-agent/sdk';

const client = new AntAgentClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.antagent.io'
});

// Get colony status
const status = await client.colony.getStatus();

// Deploy agent
const agent = await client.agents.deploy({
  type: 'scout',
  config: {
    targets: ['new_pools'],
    updateInterval: 1000
  }
});

// Get trades
const trades = await client.trades.list({ limit: 50 });
```

### Python

```bash
pip install ant-agent-sdk
```

```python
from ant_agent import AntAgentClient

client = AntAgentClient(api_key='your_api_key')

# Get colony status
status = client.colony.get_status()

# Deploy agent
agent = client.agents.deploy(
    type='scout',
    config={
        'targets': ['new_pools'],
        'updateInterval': 1000
    }
)
```

---

## Changelog

### v1.0.0 (March 2026)

- Initial API release
- Colony management endpoints
- Agent deployment and management
- Trading endpoints
- Performance metrics
- WebSocket support

---

<div align="center">

**🐜 ANT AGENT API Documentation**

For support, contact: api@antagent.io

</div>
