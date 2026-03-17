import React, { useState } from 'react';

/**
 * Settings Component - User preferences and configuration
 */
const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    maxSlippage: '2.5',
    defaultPriority: 'high',
    maxPositionSize: '1000',
    stopLoss: '5',
    takeProfit: '10',
    dailyLossLimit: '500',
    notifications: true,
    emailAlerts: false,
    darkMode: true,
  });

  const handleSave = () => {
    // Save settings logic
    console.log('Saving settings...', settings);
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      {/* Trading Settings */}
      <div className="settings-section">
        <h3>Trading Configuration</h3>
        
        <div className="form-group">
          <label>Max Slippage (%)</label>
          <input
            type="number"
            value={settings.maxSlippage}
            onChange={(e) => setSettings({ ...settings, maxSlippage: e.target.value })}
            min={0.1}
            max={10}
            step={0.1}
          />
          <span className="help-text">Maximum acceptable slippage for trades</span>
        </div>

        <div className="form-group">
          <label>Default Priority Fee</label>
          <select
            value={settings.defaultPriority}
            onChange={(e) => setSettings({ ...settings, defaultPriority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <span className="help-text">Higher priority = faster execution but higher fees</span>
        </div>

        <div className="form-group">
          <label>Max Position Size (USD)</label>
          <input
            type="number"
            value={settings.maxPositionSize}
            onChange={(e) => setSettings({ ...settings, maxPositionSize: e.target.value })}
            min={100}
            step={100}
          />
          <span className="help-text">Maximum amount per trade</span>
        </div>

        <div className="form-group">
          <label>Stop Loss (%)</label>
          <input
            type="number"
            value={settings.stopLoss}
            onChange={(e) => setSettings({ ...settings, stopLoss: e.target.value })}
            min={1}
            max={50}
            step={1}
          />
          <span className="help-text">Auto-sell when loss reaches this percentage</span>
        </div>

        <div className="form-group">
          <label>Take Profit (%)</label>
          <input
            type="number"
            value={settings.takeProfit}
            onChange={(e) => setSettings({ ...settings, takeProfit: e.target.value })}
            min={1}
            max={100}
            step={1}
          />
          <span className="help-text">Auto-sell when profit reaches this percentage</span>
        </div>

        <div className="form-group">
          <label>Daily Loss Limit (USD)</label>
          <input
            type="number"
            value={settings.dailyLossLimit}
            onChange={(e) => setSettings({ ...settings, dailyLossLimit: e.target.value })}
            min={100}
            step={100}
          />
          <span className="help-text">Stop trading when daily loss reaches this amount</span>
        </div>
      </div>

      {/* Agent Settings */}
      <div className="settings-section">
        <h3>Agent Configuration</h3>
        
        <div className="form-group">
          <label>Max Scout Agents</label>
          <input type="number" defaultValue={5} min={1} max={10} />
        </div>

        <div className="form-group">
          <label>Max Analyst Agents</label>
          <input type="number" defaultValue={5} min={1} max={10} />
        </div>

        <div className="form-group">
          <label>Max Executor Agents</label>
          <input type="number" defaultValue={3} min={1} max={10} />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Enable Learning Agents</span>
          </label>
          <span className="help-text">Allow AI to continuously improve strategies</span>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="settings-section">
        <h3>Notifications</h3>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
            />
            <span>Enable Notifications</span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
            />
            <span>Email Alerts</span>
          </label>
          <span className="help-text">Receive important alerts via email</span>
        </div>

        <div className="form-group">
          <label>Notification Preferences</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Trade Executions</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Performance Alerts</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>System Updates</span>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="settings-section">
        <h3>Appearance</h3>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
            />
            <span>Dark Mode</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <h3>Danger Zone</h3>
        
        <div className="danger-item">
          <div className="danger-info">
            <h4>Stop All Agents</h4>
            <p>Immediately stop all running agents and close positions</p>
          </div>
          <button className="btn btn-danger">Emergency Stop</button>
        </div>

        <div className="danger-item">
          <div className="danger-info">
            <h4>Reset Configuration</h4>
            <p>Reset all settings to default values</p>
          </div>
          <button className="btn btn-danger">Reset Settings</button>
        </div>

        <div className="danger-item">
          <div className="danger-info">
            <h4>Export Data</h4>
            <p>Download all trading data and performance metrics</p>
          </div>
          <button className="btn btn-secondary">Export</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
