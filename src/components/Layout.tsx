import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Zap, Calendar, BarChart3, Settings, BookOpen, ClipboardList, MoreHorizontal, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/activity', icon: Zap, label: 'Activity' },
  { to: '/routines', icon: ClipboardList, label: 'Routines' },
  { to: '/exercises', icon: BookOpen, label: 'Exercises' },
  { to: '/history', icon: Calendar, label: 'History' },
  { to: '/progress', icon: BarChart3, label: 'Stats' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// First 4 items shown on mobile, rest in "More" menu
const MOBILE_VISIBLE = 4;

export default function Layout() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();

  const mobileVisibleItems = navItems.slice(0, MOBILE_VISIBLE);
  const mobileOverflowItems = navItems.slice(MOBILE_VISIBLE);
  const isOverflowActive = mobileOverflowItems.some((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  );

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-20 bg-surface border-r border-border fixed h-full z-50">
        <div className="p-4 text-center">
          <span className="text-accent font-black text-xl">SB</span>
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

      {/* Mobile "More" overlay menu */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-16 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] p-2">
            {mobileOverflowItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-[2px] ${
                    isActive ? 'text-[#D4FF00] bg-[#D4FF00]/10' : 'text-[#888888] hover:text-[#ffffff]'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex z-50">
        {mobileVisibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setShowMore(false)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-[8px] uppercase tracking-wider transition-colors ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`
            }
          >
            <item.icon size={18} />
            <span className="mt-0.5">{item.label}</span>
          </NavLink>
        ))}
        {/* More button */}
        <button
          onClick={() => setShowMore((v) => !v)}
          className={`flex-1 flex flex-col items-center py-2 text-[8px] uppercase tracking-wider transition-colors ${
            showMore || isOverflowActive ? 'text-accent' : 'text-text-muted'
          }`}
        >
          {showMore ? <X size={18} /> : <MoreHorizontal size={18} />}
          <span className="mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
}
