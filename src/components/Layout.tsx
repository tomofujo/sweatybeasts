import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, Zap, Calendar, BarChart3, Settings, BookOpen } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/activity', icon: Zap, label: 'Activity' },
  { to: '/exercises', icon: BookOpen, label: 'Exercises' },
  { to: '/history', icon: Calendar, label: 'History' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-20 bg-surface border-r border-border fixed h-full z-50">
        <div className="p-4 text-center">
          <span className="text-accent font-black text-xl">G</span>
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-3 px-2 text-[10px] uppercase tracking-wider transition-colors ${
                isActive ? 'text-accent' : 'text-text-muted hover:text-text'
              }`
            }
          >
            <item.icon size={20} />
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 lg:ml-20 pb-20 lg:pb-0 px-4 py-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex z-50">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-[10px] uppercase tracking-wider transition-colors ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`
            }
          >
            <item.icon size={18} />
            <span className="mt-0.5">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
