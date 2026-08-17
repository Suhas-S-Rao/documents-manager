import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen bg-calm-background text-calm-text">
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-calm-surface rounded-xl shadow-soft p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default Layout
