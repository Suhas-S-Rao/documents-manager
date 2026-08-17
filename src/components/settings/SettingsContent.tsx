export default function SettingsContent() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-calm-text">General Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-calm-text">Dark Mode</span>
          <input type="checkbox" className="h-5 w-5 accent-calm-accent rounded focus:ring-calm-accent" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-calm-text">Auto Backup</span>
          <input type="checkbox" className="h-5 w-5 accent-calm-accent rounded focus:ring-calm-accent" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-calm-text">Start with Windows</span>
          <input type="checkbox" className="h-5 w-5 accent-calm-accent rounded focus:ring-calm-accent" />
        </div>
      </div>
    </>
  );
}
