import { useState } from 'react';
import { Button, Input, Select } from '../../components/ui';
import { DpiDropdownOptions, ScannerColorDropDown } from '../../constants';
import { DPI } from '../../types';
import toast from 'react-hot-toast';
import { useData } from '../../context';
import TimePicker from '../../components/ui/TimePicker';

interface Scanner {
  id: string;
  deviceId: string;
  scannerName: string;
  dpi: number;
  colorMode: string;
}

const scanners: Scanner[] = [
  {
    id: '1',
    deviceId: 'HP_GT5810',
    scannerName: 'HP DeskJet GT 5810',
    dpi: 300,
    colorMode: 'color'
  },
  {
    id: '2',
    deviceId: 'EPSON_L4160',
    scannerName: 'Epson L4160',
    dpi: 300,
    colorMode: 'color'
  }
];
const Settings = () => {
  const menus = ['Scanner', 'Google Drive', 'Local Backup'];
  const { settings, setSettings } = useData();
  const [activeMenu, setActiveMenu] = useState('Scanner');
  const [backupPath, setBackupPath] = useState('');
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [selectedScannerId, setSelectedScannerId] = useState('');
  const selectedScanner = scanners.find((x) => x.id === selectedScannerId);
  const [selectedDpi, setSelectedDpi] = useState(300);
  const [selectedColorMode, setSelectedColorMode] = useState('');

  const onScannerChange = (id: string) => {
    setSelectedScannerId(id);
    const scanner = scanners.find((x) => x.id === id);
    if (scanner) {
      setSelectedDpi(scanner.dpi);
      setSelectedColorMode(scanner.colorMode);
    }
  };

  const saveGoogleDriveSettings = async () => {
    const result = await window.api.googleDrive.updateSettings(settings);
    if (result.success) {
      toast.success('Google Drive settings saved');
    } else {
      toast.error('Failed to save Google Drive settings');
    }
  };

  const onGoogleSettingsChange = (key: 'enabled' | 'auto_backup' | 'backup_time' | 'folder_id' | 'last_backup', value: string | boolean) => {
    setSettings((prev) => ({ ...prev, google: { ...prev.google, [key]: value } }));
  };

  return (
    <div className="grid grid-cols-[250px_1000px] gap-4 bg-calm-surface text-calm-text h-[50rem]">
      {/* Sidebar */}
      <div className="rounded-xl border border-slate-200 bg-calm-surface shadow-soft p-2">
        {menus.map((menu) => (
          <button
            key={menu}
            onClick={() => setActiveMenu(menu)}
            className={`mb-1 w-full rounded-lg px-4 py-3 text-left transition cursor-pointer ${activeMenu === menu ? 'bg-calm-background text-calm-accent' : 'text-calm-text hover:bg-calm-background hover:text-calm-accent'}`}
          >
            {menu}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-200 bg-calm-surface shadow-soft p-6">
        {activeMenu === 'Scanner' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Scanner Settings</h2>

              <p className="text-sm text-slate-500">Configure scanner preferences</p>
            </div>

            <Select
              label="Scanner"
              value={selectedScannerId}
              onChange={(value) => onScannerChange(value as string)}
              options={scanners.map((scanner) => ({
                label: scanner.scannerName,
                value: scanner.id
              }))}
            />

            {selectedScanner && (
              <>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Device ID</p>
                  <p className="font-medium">{selectedScanner.deviceId}</p>
                </div>
                <Select label="Resolution" value={selectedDpi.toString()} onChange={(v) => setSelectedDpi(Number(v) as DPI)} options={DpiDropdownOptions} />
                <Select label="Color Mode" value={selectedColorMode} onChange={(v) => setSelectedColorMode(v as string)} options={ScannerColorDropDown} />

                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </>
            )}
          </div>
        )}
        {activeMenu === 'Google Drive' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-calm-text">Google Drive Backup</h2>
              <p className="text-sm text-slate-500">Backup your documents and database automatically to Google Drive</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium">Enable Google Drive Backup</p>
                <p className="text-sm text-slate-500">Keep your documents backed up securely</p>
              </div>
              <button
                onClick={() => onGoogleSettingsChange('enabled', !settings.google.enabled)}
                className={`h-6 w-12 rounded-full transition cursor-pointer ${settings.google.enabled ? 'bg-calm-accent' : 'bg-slate-300'}`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition ${settings.google.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {settings.google.enabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="font-medium">Automatic Daily Backup</p>
                    <p className="text-sm text-slate-500">Backup automatically at scheduled time</p>
                  </div>
                  <button
                    onClick={() => onGoogleSettingsChange('auto_backup', !settings.google.auto_backup)}
                    className={`h-6 w-12 rounded-full transition cursor-pointer ${settings.google.auto_backup ? 'bg-calm-accent' : 'bg-slate-300'}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white transition ${settings.google.auto_backup ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {settings.google.auto_backup && (
                  <TimePicker label="Backup Time" value={settings.google.backup_time ?? ''} onChange={(v) => onGoogleSettingsChange('backup_time', v)} className="cursor-pointer" />
                )}
                <div className="flex gap-3">
                  <Button onClick={saveGoogleDriveSettings}>Save Settings</Button>
                  <Button
                    onClick={async () => {
                      const result = await window.api.googleDrive.connect();
                      if (result.success) {
                        toast.success('Google Drive connected successfully');
                      } else {
                        toast.error(result.error);
                      }
                    }}
                  >
                    Connect Google Drive
                  </Button>
                  <Button
                    onClick={async () => {
                      const result = await window.api.googleDrive.backup();

                      if (result.success) {
                        toast.success('Backup completed successfully');
                      } else {
                        toast.error(result.error);
                      }
                    }}
                  >
                    Backup Now
                  </Button>
                </div>
                {settings.google.last_backup && <p className="text-sm text-slate-500">Last Backup: {new Date(settings.google.last_backup).toLocaleString()}</p>}
              </div>
            )}
          </div>
        )}
        {activeMenu === 'Local Backup' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-calm-text">Local Backup</h2>
              <p className="text-sm text-slate-500">Backup your documents to a local folder</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-5">
              <div>
                <p className="font-medium text-calm-text">Automatic Local Backup</p>
                <p className="text-sm text-slate-500">Automatically create backups of your documents</p>
              </div>

              <button onClick={() => setBackupEnabled(!backupEnabled)} className={` h-6 w-12 rounded-full transition cursor-pointer ${backupEnabled ? 'bg-calm-accent' : 'bg-slate-300'} `}>
                <div className={`h-5 w-5 rounded-full bg-white transition ${backupEnabled ? 'translate-x-6' : 'translate-x-1'} `} />
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 p-5 space-y-4">
              <Input label="Backup Location" placeholder="Select backup folder" value={backupPath} onChange={(e) => setBackupPath(e.target.value)} />

              <div className="flex gap-3">
                <Button>Select Folder</Button>
                <Button variant="secondary">Backup Now</Button>
              </div>

              {backupPath && (
                <div className="rounded-lg bg-calm-background p-3 text-sm text-slate-500">
                  Backup location:
                  <br />
                  {backupPath}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
