import React from 'react';

const Settings: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>⚙️ Settings</h2>
      <label>
        <input type="checkbox" /> Enable sound effects
      </label>
      <br />
      <label>
        <input type="checkbox" /> Show avatar animations
      </label>
    </div>
  );
};

export default Settings;
