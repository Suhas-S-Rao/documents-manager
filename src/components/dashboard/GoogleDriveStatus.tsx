import { Button } from '../ui/index';

const GoogleDriveStatus = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-calm-surface p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-calm-text">Google Drive</h2>

        <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Not Connected</span>
      </div>
      <div className="space-y-3 text-sm text-calm-text mb-4">
        <div className="flex justify-between">
          <span>Account</span>
          <span>-</span>
        </div>

        <div className="flex justify-between">
          <span>Last Backup</span>
          <span>Never</span>
        </div>

        <div className="flex justify-between">
          <span>Synced Files</span>
          <span>0</span>
        </div>
      </div>
      <Button className="w-full">Connect Google Drive</Button>
    </div>
  );
};
export default GoogleDriveStatus;
