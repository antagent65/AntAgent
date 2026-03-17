import React, { useState } from 'react';

/**
 * Agent Deploy Component - Deploy and configure new agents
 */
const AgentDeploy: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'scout' | 'analyst' | 'executor'>('scout');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Deployment logic here
    setTimeout(() => setIsDeploying(false), 2000);
  };

  return (
    <div className="agent-deploy">
      <div className="deploy-header">
        <h2>Deploy Agent</h2>
        <p className="subtitle">Configure and deploy a new AI agent to your colony</p>
      </div>

      {/* Agent Type Selection */}
      <div className="agent-type-selector">
        <h3>Select Agent Type</h3>
        <div className="type-options">
          <button
            className={`type-option ${selectedType === 'scout' ? 'selected' : ''}`}
            onClick={() => setSelectedType('scout')}
          >
            <span className="option-icon">🔍</span>
            <span className="option-name">Scout</span>
            <span className="option-desc">Data collection & signal detection</span>
          </button>

          <button
            className={`type-option ${selectedType === 'analyst' ? 'selected' : ''}`}
            onClick={() => setSelectedType('analyst')}
          >
            <span className="option-icon">📊</span>
            <span className="option-name">Analyst</span>
            <span className="option-desc">AI analysis & predictions</span>
          </button>

          <button
            className={`type-option ${selectedType === 'executor' ? 'selected' : ''}`}
            onClick={() => setSelectedType('executor')}
          >
            <span className="option-icon">⚡</span>
            <span className="option-name">Executor</span>
            <span className="option-desc">Trade execution & optimization</span>
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="config-form">
        <h3>Configuration</h3>
        
        {selectedType === 'scout' && (
          <ScoutConfig />
        )}
        
        {selectedType === 'analyst' && (
          <AnalystConfig />
        )}
        
        {selectedType === 'executor' && (
          <ExecutorConfig />
        )}
      </div>

      {/* Deploy Button */}
      <div className="deploy-actions">
        <button 
          className="btn btn-primary btn-large"
          onClick={handleDeploy}
          disabled={isDeploying}
        >
          {isDeploying ? 'Deploying...' : '🚀 Deploy Agent'}
        </button>
      </div>
    </div>
  );
};

/**
 * Scout Configuration Form
 */
const ScoutConfig: React.FC = () => {
  return (
    <div className="config-section">
      <div className="form-group">
        <label>Monitoring Targets</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>New Pools</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Whale Alerts</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Price Movements</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span>Volume Spikes</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Update Interval (ms)</label>
        <input type="number" defaultValue={1000} min={100} step={100} />
      </div>

      <div className="form-group">
        <label>Signal Threshold</label>
        <input type="range" min={0} max={1} step={0.1} defaultValue={0.7} />
        <span className="range-value">0.7</span>
      </div>
    </div>
  );
};

/**
 * Analyst Configuration Form
 */
const AnalystConfig: React.FC = () => {
  return (
    <div className="config-section">
      <div className="form-group">
        <label>AI Models</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Momentum</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Mean Reversion</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Breakout</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>ML Classifier</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Confidence Threshold</label>
        <input type="range" min={0} max={1} step={0.05} defaultValue={0.75} />
        <span className="range-value">0.75</span>
      </div>

      <div className="form-group">
        <label>Risk Tolerance</label>
        <select defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  );
};

/**
 * Executor Configuration Form
 */
const ExecutorConfig: React.FC = () => {
  return (
    <div className="config-section">
      <div className="form-group">
        <label>Max Slippage (%)</label>
        <input type="number" defaultValue={2.0} min={0.1} max={10} step={0.1} />
      </div>

      <div className="form-group">
        <label>Priority Fee</label>
        <select defaultValue="high">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="form-group">
        <label>Position Size (USD)</label>
        <input type="number" defaultValue={1000} min={100} step={100} />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" defaultChecked />
          <span>Enable Order Splitting</span>
        </label>
      </div>
    </div>
  );
};

export default AgentDeploy;
