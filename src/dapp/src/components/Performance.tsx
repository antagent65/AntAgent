import React, { useState } from 'react';

/**
 * Performance Component - Analytics and performance metrics
 */
const Performance: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  return (
    <div className="performance">
      <div className="performance-header">
        <h2>Performance Analytics</h2>
        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === '24h' ? 'active' : ''}`}
            onClick={() => setTimeRange('24h')}
          >
            24H
          </button>
          <button
            className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            7D
          </button>
          <button
            className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30D
          </button>
          <button
            className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            ALL
          </button>
        </div>
      </div>

      {/* PnL Chart Placeholder */}
      <div className="pnl-chart">
        <div className="chart-header">
          <h3>PnL Over Time</h3>
          <span className="pnl-value positive">+$2,450.00</span>
        </div>
        <div className="chart-container">
          <div className="chart-placeholder">
            <svg viewBox="0 0 400 200" className="chart-svg">
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                points="0,150 50,140 100,120 150,130 200,100 250,80 300,60 350,40 400,30"
              />
              <polyline
                fill="rgba(16,185,129,0.1)"
                stroke="none"
                points="0,200 0,150 50,140 100,120 150,130 200,100 250,80 300,60 350,40 400,30 400,200"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total PnL</span>
          <span className="metric-value positive">+$2,450.00</span>
          <span className="metric-change">+12.5%</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Win Rate</span>
          <span className="metric-value">68.5%</span>
          <span className="metric-change positive">+2.3%</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Trades</span>
          <span className="metric-value">142</span>
          <span className="metric-change">+18 this week</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg Trade</span>
          <span className="metric-value">$850</span>
          <span className="metric-change">-5.2%</span>
        </div>
      </div>

      {/* Trade History */}
      <div className="trade-history">
        <h3>Recent Trades</h3>
        <div className="trade-table">
          <div className="trade-table-header">
            <span>Pair</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Price</span>
            <span>PnL</span>
            <span>Time</span>
          </div>
          <div className="trade-row">
            <span className="trade-pair">SOL/USDC</span>
            <span className="trade-type buy">BUY</span>
            <span className="trade-amount">$1,000</span>
            <span className="trade-price">$105.50</span>
            <span className="trade-pnl positive">+$125.00</span>
            <span className="trade-time">2m ago</span>
          </div>
          <div className="trade-row">
            <span className="trade-pair">RAY/USDC</span>
            <span className="trade-type sell">SELL</span>
            <span className="trade-amount">$500</span>
            <span className="trade-price">$1.85</span>
            <span className="trade-pnl positive">+$45.00</span>
            <span className="trade-time">15m ago</span>
          </div>
          <div className="trade-row">
            <span className="trade-pair">BONK/SOL</span>
            <span className="trade-type buy">BUY</span>
            <span className="trade-amount">$250</span>
            <span className="trade-price">$0.0000012</span>
            <span className="trade-pnl negative">-$12.50</span>
            <span className="trade-time">1h ago</span>
          </div>
          <div className="trade-row">
            <span className="trade-pair">JUP/USDC</span>
            <span className="trade-type sell">SELL</span>
            <span className="trade-amount">$750</span>
            <span className="trade-price">$0.85</span>
            <span className="trade-pnl positive">+$82.00</span>
            <span className="trade-time">3h ago</span>
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="agent-performance">
        <h3>Agent Performance</h3>
        <div className="agent-performance-list">
          <div className="agent-perf-item">
            <div className="agent-perf-header">
              <span className="agent-perf-name">🔍 Scout-001</span>
              <span className="agent-perf-score">92/100</span>
            </div>
            <div className="agent-perf-bar">
              <div className="agent-perf-fill" style={{ width: '92%' }}></div>
            </div>
            <div className="agent-perf-stats">
              <span>Signals: 142</span>
              <span>Valid: 89%</span>
            </div>
          </div>
          <div className="agent-perf-item">
            <div className="agent-perf-header">
              <span className="agent-perf-name">📊 Analyst-001</span>
              <span className="agent-perf-score">87/100</span>
            </div>
            <div className="agent-perf-bar">
              <div className="agent-perf-fill" style={{ width: '87%' }}></div>
            </div>
            <div className="agent-perf-stats">
              <span>Predictions: 48</span>
              <span>Accuracy: 73%</span>
            </div>
          </div>
          <div className="agent-perf-item">
            <div className="agent-perf-header">
              <span className="agent-perf-name">⚡ Executor-001</span>
              <span className="agent-perf-score">95/100</span>
            </div>
            <div className="agent-perf-bar">
              <div className="agent-perf-fill" style={{ width: '95%' }}></div>
            </div>
            <div className="agent-perf-stats">
              <span>Trades: 12</span>
              <span>Win Rate: 75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
