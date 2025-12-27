import React, { useState, useEffect } from 'react';
import { api } from '../api';

const Settings = () => {
  const [settings, setSettings] = useState({
    logo_url: '',
    primary_color: '#6366f1',
    secondary_color: '#ec4899',
    font_family: 'Inter'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));

    // Live Preview of CSS variables
    if (name === 'primary_color') document.documentElement.style.setProperty('--primary', value);
    if (name === 'secondary_color') document.documentElement.style.setProperty('--secondary', value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveSettings(settings);
      alert('Settings saved!');
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">White Label Settings</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Primary Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              name="primary_color"
              value={settings.primary_color}
              onChange={handleChange}
              className="h-10 w-20 cursor-pointer"
            />
            <input
              type="text"
              value={settings.primary_color}
              readOnly
              className="flex-1 p-2 rounded border bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Secondary Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              name="secondary_color"
              value={settings.secondary_color}
              onChange={handleChange}
              className="h-10 w-20 cursor-pointer"
            />
             <input
              type="text"
              value={settings.secondary_color}
              readOnly
              className="flex-1 p-2 rounded border bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Agency Logo URL</label>
          <input
            type="url"
            name="logo_url"
            value={settings.logo_url}
            onChange={handleChange}
            className="w-full p-2 rounded border"
            placeholder="https://..."
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
