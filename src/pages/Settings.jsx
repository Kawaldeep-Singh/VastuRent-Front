import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { 
  Save, Key, FileSpreadsheet, UserCheck, Check, AlertCircle, Sparkles
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    spreadsheetId: '',
    credentialsJson: '',
    geminiApiKey: '',
    mockMode: true,
    brokerName: '',
    agencyName: ''
  });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/settings');
      if (response.data?.settings) setSettings(response.data.settings);
    } catch (err) {
      setError("Failed to load configuration. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/settings', settings);
      if (response.data?.success) {
        setSuccess("Settings updated and persisted successfully!");
        const { settings: saved } = response.data;
        setSettings(prev => ({ ...prev, spreadsheetId: saved.spreadsheetId, mockMode: saved.mockMode, brokerName: saved.brokerName, agencyName: saved.agencyName }));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col">
      <Navbar title="System Settings" />
      <div className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto space-y-6 animate-fade-in overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-display">API & Branding</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Manage credentials, sheet links, and message signature.</p>
            </div>
          </div>

          {loading ? (
            <div className="glass-card p-12 text-center text-violet-400 font-semibold rounded-2xl flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              <span>Fetching configuration...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
              {/* Notifications */}
              {error && (
                <div className="flex items-center gap-2.5 bg-rose-500/[0.06] border border-rose-500/[0.12] text-rose-400 p-4 rounded-xl animate-slide-up">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 bg-emerald-500/[0.06] border border-emerald-500/[0.12] text-emerald-400 p-4 rounded-xl animate-slide-up">
                  <Check size={16} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Google Sheets */}
              <SettingsSection icon={<FileSpreadsheet size={16} />} title="Google Sheets Integration">
                <div className="flex items-center justify-between p-3.5 bg-[#0a0e1a]/60 border border-white/[0.04] rounded-xl">
                  <div>
                    <span className="text-slate-200 block">Mock Mode Fallback</span>
                    <span className="text-[10px] text-slate-500 font-normal mt-0.5 block leading-relaxed">
                      Uses local in-memory listings when active, ignoring Sheets API.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="mockMode" checked={settings.mockMode} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500 peer-checked:after:bg-white peer-checked:after:border-violet-500" />
                  </label>
                </div>

                {!settings.mockMode && (
                  <div className="space-y-4 animate-slide-up">
                    <FormField label="Google Spreadsheet ID" hint="Extract ID from your sheet URL">
                      <input
                        type="text" name="spreadsheetId" value={settings.spreadsheetId} onChange={handleInputChange}
                        placeholder="e.g. 1L2h9K-pQo7DkWt..."
                        className="w-full p-2.5 glass-input rounded-lg text-slate-200 placeholder-slate-600 text-xs"
                        required={!settings.mockMode}
                      />
                    </FormField>
                    <FormField label="Service Account Credentials JSON" hint="Paste complete JSON key file contents">
                      <textarea
                        name="credentialsJson" value={settings.credentialsJson} onChange={handleInputChange}
                        placeholder='{ "type": "service_account", ... }'
                        rows={4}
                        className="w-full p-3 glass-input rounded-lg text-slate-200 placeholder-slate-600 font-mono text-[10px] resize-none"
                      />
                    </FormField>
                  </div>
                )}
              </SettingsSection>

              {/* Gemini API */}
              <SettingsSection icon={<Key size={16} />} title="Gemini AI Credentials">
                <FormField label="Gemini API Key" hint={
                  <span className="flex items-center gap-1">
                    <Sparkles size={10} className="text-violet-400" />
                    Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Google AI Studio</a>
                  </span>
                }>
                  <input
                    type="password" name="geminiApiKey" value={settings.geminiApiKey} onChange={handleInputChange}
                    placeholder="Enter Google AI Studio API Key..."
                    className="w-full p-2.5 glass-input rounded-lg text-slate-200 placeholder-slate-600 text-xs"
                  />
                </FormField>
              </SettingsSection>

              {/* Branding */}
              <SettingsSection icon={<UserCheck size={16} />} title="Broker Signature">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Broker Name" hint="Appears in WhatsApp message signature">
                    <input
                      type="text" name="brokerName" value={settings.brokerName} onChange={handleInputChange}
                      placeholder="e.g. Kawal"
                      className="w-full p-2.5 glass-input rounded-lg text-slate-200 placeholder-slate-600 text-xs"
                    />
                  </FormField>
                  <FormField label="Agency Name" hint="Appears under your name in signature">
                    <input
                      type="text" name="agencyName" value={settings.agencyName} onChange={handleInputChange}
                      placeholder="e.g. Vastu Rentals"
                      className="w-full p-2.5 glass-input rounded-lg text-slate-200 placeholder-slate-600 text-xs"
                    />
                  </FormField>
                </div>
              </SettingsSection>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-500/20 flex items-center gap-2 text-sm uppercase tracking-wider btn-shimmer"
                >
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> <span>Saving...</span></>
                  ) : (
                    <><Save size={16} /> <span>Save Settings</span></>
                  )}
                </button>
              </div>
            </form>
          )}
      </div>
    </div>
  );
}

function SettingsSection({ icon, title, children }) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-2 text-violet-400 border-b border-white/[0.04] pb-3">
        {icon}
        <h3 className="font-bold text-sm text-slate-100 font-display">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="block text-slate-400 mb-1.5 text-xs font-semibold">{label}</label>
      {children}
      {hint && <span className="text-[10px] text-slate-500 font-normal leading-relaxed mt-1.5 block">{hint}</span>}
    </div>
  );
}
