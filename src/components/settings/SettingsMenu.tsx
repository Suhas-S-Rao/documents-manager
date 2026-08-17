const menus = ['General', 'Scanner', 'Google Drive', 'Backup', 'Storage', 'Appearance', 'About'];

export default function SettingsMenu() {
  return (
    <>
      {menus.map((menu) => (
        <button key={menu} className="mb-1 w-full rounded-lg px-4 py-3 text-left text-calm-text transition hover:bg-calm-background hover:text-calm-accent cursor-pointer">
          {menu}
        </button>
      ))}
    </>
  );
}
