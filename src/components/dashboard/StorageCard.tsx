const StorageCard = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-calm-surface p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-calm-text">Storage</h2>
        <span className="text-sm text-slate-500">2.8 GB / 10 GB</span>
      </div>

      <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-[28%] rounded-full bg-calm-accent" />
      </div>

      <div className="space-y-2 text-sm text-calm-text">
        <div className="flex justify-between">
          <span>Documents</span>
          <span>245</span>
        </div>
        <div className="flex justify-between">
          <span>PDF Pages</span>
          <span>1,428</span>
        </div>
        <div className="flex justify-between">
          <span>Database</span>
          <span>24 MB</span>
        </div>
      </div>
    </div>
  );
};
export default StorageCard;
