import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, Receipt, Settings as SettingsIcon } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[var(--bg-color)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 mr-0 flex flex-col p-4">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            Totem Manager
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/50'}`}>
            <LayoutDashboard size={20} />
            <span>Projects</span>
          </NavLink>
          <NavLink to="/finance" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/50'}`}>
            <Wallet size={20} />
            <span>Finance</span>
          </NavLink>
          <NavLink to="/pocket" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/50'}`}>
            <Receipt size={20} />
            <span>Pocket</span>
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/50'}`}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="mt-auto p-4 bg-white/30 rounded-lg text-sm">
          <p className="font-semibold">Totem Mass Media</p>
          <p className="text-xs opacity-70">Logged in</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
