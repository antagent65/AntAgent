import React, { useState, useEffect } from 'react';

/**
 * Dashboard Component - Main overview of colony status
 */
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalValue: 0,
    totalPnl: 0,
    activeAgents: 0,
    totalTrades: 0,
    winRate: 0,
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Colony Dashboard</h2>
        <p className="subtitle">Real-time overview of your ANT AGENT colony</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">${stats.totalValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-label">Total PnL</span>
            <span className={`stat-value ${stats.totalPnl >= 0 ? 'positive' : 'negative'}`}>
              {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-info">
            <span className="stat-label">Active Agents</span>
            <span className="stat-value">{stats.activeAgents}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{stats.winRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span>Deploy Agent</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">▶️</span>
            <span>Start Colony</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">⏸️</span>
            <span>Pause Colony</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🔍</span>
            <div className="activity-info">
              <span className="activity-title">Scout agent deployed</span>
              <span className="activity-time">2 minutes ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">⚡</span>
            <div className="activity-info">
              <span className="activity-title">Trade executed</span>
              <span className="activity-time">5 minutes ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📈</span>
            <div className="activity-info">
              <span className="activity-title">Prediction generated</span>
              <span className="activity-time">10 minutes ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="agent-status">
        <h3>Agent Status</h3>
        <div className="agent-list">
          <div className="agent-item">
            <div className="agent-header">
              <span className="agent-name">🔍 Scout-001</span>
              <span className="agent-status-badge running">Running</span>
            </div>
            <div className="agent-stats">
              <span>Signals: 142</span>
              <span>Uptime: 2h 34m</span>
            </div>
          </div>
          <div className="agent-item">
            <div className="agent-header">
              <span className="agent-name">📊 Analyst-001</span>
              <span className="agent-status-badge running">Running</span>
            </div>
            <div className="agent-stats">
              <span>Predictions: 48</span>
              <span>Avg Confidence: 78%</span>
            </div>
          </div>
          <div className="agent-item">
            <div className="agent-header">
              <span className="agent-name">⚡ Executor-001</span>
              <span className="agent-status-badge running">Running</span>
            </div>
            <div className="agent-stats">
              <span>Trades: 12</span>
              <span>Win Rate: 75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
