const ScannerStatus = () => {
  const scanners = [
    { id: 1, name: 'Epson DS-530', status: 'Connected', isDefault: true },
    { id: 2, name: 'HP ScanJet Pro 2500', status: 'Disconnected', isDefault: false },
    { id: 3, name: 'Brother ADS-2200', status: 'Connected', isDefault: false }
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-calm-surface p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-calm-text">Available Scanners</h2>
        <span className="rounded-full bg-calm-background px-3 py-1 text-xs font-medium text-calm-accent">{scanners.filter((s) => s.status === 'Connected').length} Connected</span>
      </div>

      <div className="space-y-3">
        {scanners.map((scanner) => (
          <div key={scanner.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-calm-background transition">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-calm-text">{scanner.name}</p>
                {scanner.isDefault && <span className="rounded bg-calm-background px-2 py-0.5 text-xs text-calm-accent">Default</span>}
              </div>
              <p className="text-sm text-slate-500">{scanner.status}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${scanner.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{scanner.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ScannerStatus;
