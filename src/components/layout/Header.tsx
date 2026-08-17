import { NavLink } from 'react-router-dom';

const menus = [
  { name: 'Dashboard', path: '/' },
  { name: 'Documents', path: '/documents' },
  { name: 'Add Document', path: '/addDocument' },
  { name: 'Tags', path: '/tags' },
  { name: 'Settings', path: '/settings' }
];

const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between bg-calm-surface px-6 shadow-soft">
      <div className="text-xl font-bold text-slate-800">Documents Manager</div>
      <nav className="flex items-center gap-2 ml-8">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            end={menu.path === '/'}
            className={({ isActive }) =>
              `rounded-md px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-calm-accent text-white shadow-glow' : 'text-slate-700 hover:bg-calm-background hover:text-calm-accent'}`
            }
          >
            {menu.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};
export default Header;
