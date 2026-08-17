import SettingsMenu from '../../components/settings/SettingsMenu';
import SettingsContent from '../../components/settings/SettingsContent';

const Settings = () => {
  return (
    <div className="grid grid-cols-[250px_1fr] gap-4 bg-calm-surface text-calm-text">
      {/* Sidebar */}
      <div className="rounded-xl border border-slate-200 bg-calm-surface shadow-soft">
        <SettingsMenu />
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-200 bg-calm-surface shadow-soft p-6">
        <SettingsContent />
      </div>
    </div>
  );
};

export default Settings;
