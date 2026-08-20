import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import { Button, Input, Select, TimePicker } from '../../components/ui';
import { DpiDropdownOptions, ScannerColorDropDown } from '../../constants';
import { useData } from '../../context';
import { DPI, Scanner, ScannerColor } from '../../types';

const Settings = () => {
  const menus = ['Scanner', 'Google Drive'];
  const { settings, setSettings, startLoader, stopLoader, loadData, detectedScanners, setDetectedScanners, scanners, setScanners } = useData();
  const [activeMenu, setActiveMenu] = useState('Scanner');
  const [selectedScannerId, setSelectedScannerId] = useState<string>('');
  const [selectedScanner, setSelectedScanner] = useState<Scanner>();

  useEffect(() => {
    const scannerSel = scanners.find((x) => x.scanner_id === selectedScannerId);
    if (scannerSel) {
      setSelectedScanner(scannerSel);
      return;
    }
    const detected = detectedScanners.find((x) => x.scanner_id === selectedScannerId);
    if (detected) {
      setSelectedScanner({
        id: v4(),
        scanner_id: detected.scanner_id,
        scanner_name: detected.scanner_name,
        dpi: 300,
        color_mode: 'color',
        is_default: false
      });
    }
  }, [selectedScannerId, scanners, detectedScanners]);

  useEffect(() => {
    if (scanners.length > 0) {
      setSelectedScannerId(scanners[0].scanner_id);
    }
  }, [scanners]);

  const onSaveScannerSettings = async () => {
    if (!selectedScanner) {
      return;
    }
    try {
      startLoader('saveScannerSettings', 'Saving scanner properties...');
      const scannerSel = scanners?.find((x) => x.scanner_id === selectedScannerId);
      if (scannerSel) {
        let result = await window.api.scanner.updateSettings(selectedScanner);
        if (result.success) {
          toast.success('Scanner settings saved');
          setScanners((prev) =>
            prev.map((x) => {
              if (x.id === selectedScanner.id) {
                return result.data;
              }
              return x;
            })
          );
        } else {
          toast.error(result.error ?? 'Failed to update scanner settings');
        }
      } else {
        let result = await window.api.scanner.insertSettings(selectedScanner);
        if (result.success) {
          toast.success('Scanner settings saved');
          setScanners((prev) => [...prev, result.data]);
        } else {
          toast.error(result.error ?? 'Failed to save scanner settings');
        }
      }
    } finally {
      stopLoader('saveScannerSettings');
    }
  };

  const saveGoogleDriveSettings = async () => {
    try {
      startLoader('updateGoogleSettings', 'Updating...');
      const result = await window.api.googleDrive.updateSettings(settings.google);
      if (result.success) {
        toast.success('Google Drive settings saved');
      } else {
        toast.error('Failed to save Google Drive settings');
      }
    } finally {
      stopLoader('updateGoogleSettings');
    }
  };

  const onGoogleSettingsChange = (key: 'enabled' | 'auto_backup' | 'backup_time' | 'folder_id' | 'last_backup', value: string | boolean) => {
    setSettings((prev) => ({ ...prev, google: { ...prev.google, [key]: value } }));
  };

  const onBackUp = async () => {
    try {
      startLoader('googleBackup', 'Backup Inprogress');
      const result = await window.api.googleDrive.backup();
      if (result.success) {
        toast.success('Backup completed successfully');
        setSettings((prev) => ({ ...prev, google: { ...prev.google, last_backup: new Date().toISOString() } }));
      } else {
        toast.error(result.error);
      }
    } finally {
      stopLoader('googleBackup');
    }
  };

  const onRestore = async () => {
    try {
      startLoader('googleRestore', 'Restore Inprogress');
      const result = await window.api.googleDrive.restore();
      if (result.success) {
        toast.success('Restore completed successfully');
        loadData();
      } else {
        toast.error(result.error);
      }
    } finally {
      stopLoader('googleRestore');
    }
  };

  const onConnect = async () => {
    try {
      startLoader('googleConnect', 'Connecting to GOOGLE');
      const result = await window.api.googleDrive.connect();
      if (result.success) {
        toast.success('Google Drive connected successfully');
      } else {
        toast.error(result.error);
      }
    } finally {
      stopLoader('googleConnect');
    }
  };

  return (
    <div className="grid grid-cols-[250px_1000px] gap-4 bg-calm-surface text-calm-text h-[50rem]">
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

      <div className="rounded-xl border border-slate-200 bg-calm-surface shadow-soft p-6">
        {activeMenu === 'Scanner' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Scanner Settings</h2>
              <p className="text-sm text-slate-500">Configure scanner preferences</p>
            </div>
            {detectedScanners.length === 0 && <div>No device detected</div>}
            <Button
              variant="secondary"
              onClick={async () => {
                let result = await window.api.scanner.getScannersList();
                setDetectedScanners(result);
              }}
            >
              Detect Scanners
            </Button>
            <Select
              label="Scanner"
              value={selectedScannerId}
              onChange={(value) => setSelectedScannerId(value as string)}
              options={detectedScanners.map((scanner) => ({
                label: scanner.scanner_name,
                value: scanner.scanner_id
              }))}
            />
            {selectedScanner && (
              <>
                {/* is default toggle */}
                <Input label="Name" value={selectedScanner.scanner_name} onChange={(e) => setSelectedScanner((prev) => (prev ? { ...prev, scanner_name: e.target.value } : prev))} />
                <Select
                  label="Resolution"
                  value={selectedScanner.dpi.toString()}
                  onChange={(v) => setSelectedScanner((prev) => (prev ? { ...prev, dpi: Number(v) as DPI } : prev))}
                  options={DpiDropdownOptions}
                />

                <Select
                  label="Color Mode"
                  value={selectedScanner.color_mode}
                  onChange={(v) => setSelectedScanner((prev) => (prev ? { ...prev, color_mode: v as ScannerColor } : prev))}
                  options={ScannerColorDropDown}
                />

                <div className="flex justify-end gap-3">
                  <Button variant="primary" onClick={onSaveScannerSettings}>
                    Save Settings
                  </Button>
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

            <div className="space-y-4">
              {settings.google.enabled && (
                <>
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
                </>
              )}
              <div className={`flex gap-3 w-full ${settings.google.enabled ? 'justify-between' : 'justify-end'}`}>
                {settings.google.enabled && settings.google.last_backup && <p className="text-sm text-slate-500">Last Backup: {new Date(settings.google.last_backup).toLocaleString()}</p>}
                <div className="flex gap-3 justify-end w-[max-content]">
                  {settings.google.enabled && (
                    <>
                      <Button variant="secondary" onClick={onConnect}>
                        Connect Google Drive
                      </Button>
                      <Button variant="info" onClick={onBackUp}>
                        Backup Now
                      </Button>
                      <Button variant="warning" onClick={onRestore}>
                        Restore
                      </Button>
                    </>
                  )}
                  <Button variant="primary" onClick={saveGoogleDriveSettings}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
