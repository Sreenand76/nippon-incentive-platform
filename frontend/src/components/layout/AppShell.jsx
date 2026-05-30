import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataProvider } from '../../context/DataContext';
import {
  Calculator,
  Car,
  History,
  Layers,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

const AppShell = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const navItems = isAdmin
    ? [
        { to: '/admin/cars', label: 'Car models', icon: Car },
        { to: '/admin/slabs', label: 'Incentive slabs', icon: Layers },
      ]
    : [
        { to: '/sales/dashboard', label: 'Calculate incentives', icon: Calculator },
        { to: '/sales/submissions', label: 'Past submissions', icon: History },
      ];

  const roleLabel = isAdmin ? 'Administrator' : 'Sales officer';

  const sidebar = (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-900/30">
            NT
          </div>
          <div>
            <p className="font-bold text-white tracking-tight leading-tight">Nippon Toyota</p>
            <p className="text-xs text-slate-400">Incentive platform</p>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3 px-1">
        Navigation
      </p>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
        <div className="rounded-xl bg-slate-800/80 px-3 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Shield className="w-3.5 h-3.5" />
            {roleLabel}
          </div>
          <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-red-600/90 text-slate-200 hover:text-white py-2.5 text-sm font-medium transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <DataProvider>
      {/* Root: full viewport height, no overflow — children manage their own scroll */}
      <div className="h-screen h-[100dvh] flex flex-col lg:flex-row bg-slate-50 overflow-hidden">

        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar — fixed height, no growth */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,18rem)] bg-slate-900 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto lg:w-64 shrink-0 lg:h-full overflow-y-auto ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
          {sidebar}
        </aside>

        {/* Main — takes remaining width, scrolls independently */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 lg:hidden shrink-0">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-center flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Nippon Incentive</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{roleLabel}</p>
            </div>
            <div className="w-9" aria-hidden />
          </header>

          {/* Scrollable content area only */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="bg-gradient-to-b from-slate-50 via-white/50 to-slate-100/80 min-h-full">
              <div className="page-container px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>

      </div>
    </DataProvider>
  );
};

export default AppShell;
