import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useThemeStore } from '../store/useThemeStore';
import { Sun, Moon, LayoutDashboard, Wrench, ClipboardList, User, Settings, LogOut } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuthStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { theme, toggleTheme } = useThemeStore();
  const { 
    currency, 
    setCurrency, 
    symbol: getSymbol, 
    availableCurrencies, 
    currencyNames 
  } = useCurrencyStore();

  const symbol = getSymbol();

  const roleBadge = {
    ADMIN: { text: 'Admin', class: 'badge-primary' },
    USER: { text: 'User', class: 'badge-ghost' },
    DRIVER: { text: 'Driver', class: 'badge-accent' },
    INDIVIDUAL: { text: '', class: '' },
    admin: { text: 'Admin', class: 'badge-primary' },
    user: { text: 'User', class: 'badge-ghost' },
    individual: { text: '', class: '' },
  };

  const badge = roleBadge[user?.role] || roleBadge.individual;

  return (
    <div className="navbar bg-carbon border border-industrial-border shadow-2xl rounded-box mb-6 px-6 relative z-[100]">
      <div className="flex-1">
        <Link to="/" className="text-2xl font-black text-neon-violet tracking-tighter uppercase italic drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">LuxeFuel</Link>
        {user?.organizationName && (
          <span className="ml-3 text-sm opacity-50 hidden sm:inline">
            {user.organizationName}
          </span>
        )}
      </div>
      <div className="flex-none gap-2 items-center">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm btn-circle text-text-secondary hover:text-neon-violet transition-colors"
          title="Toggle Theme"
        >
          {theme === 'midnight_jdm' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Currency Selector */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
            <span className="text-lg">{symbol}</span>
            <span className="font-semibold">{currency}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-56 z-[110]">
            {availableCurrencies.map(code => (
              <li key={code}>
                <button
                  className={`flex justify-between ${currency === code ? 'active' : ''}`}
                  onClick={() => setCurrency(code)}
                >
                  <span className="font-medium">{code}</span>
                  <span className="opacity-60 text-sm">{currencyNames[code]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* User Menu */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-semibold">{user?.name}</span>
            {badge.text && (
              <span className={`badge badge-xs ${badge.class}`}>{badge.text}</span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-2xl bg-carbon border border-industrial-border rounded-box w-48 z-[110]">
            <li><Link to="/" className="hover:bg-neon-violet hover:text-white transition-all"><LayoutDashboard className="w-4 h-4" aria-hidden="true" /> Dashboard</Link></li>
            <li><Link to="/maintenance" className="hover:bg-neon-violet hover:text-white transition-all"><Wrench className="w-4 h-4" aria-hidden="true" /> Maintenance</Link></li>
            <li><Link to="/mileage-log" className="hover:bg-neon-violet hover:text-white transition-all"><ClipboardList className="w-4 h-4" aria-hidden="true" /> Mileage Log</Link></li>
            <li><Link to="/profile" className="hover:bg-neon-violet hover:text-white transition-all"><User className="w-4 h-4" aria-hidden="true" /> Profile</Link></li>
            {isAdmin() && (
              <li><Link to="/admin" className="hover:bg-neon-violet hover:text-white transition-all"><Settings className="w-4 h-4" aria-hidden="true" /> Admin Panel</Link></li>
            )}
            <li><button onClick={logout} className="hover:bg-error hover:text-error-content transition-all"><LogOut className="w-4 h-4" aria-hidden="true" /> Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
