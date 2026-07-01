import { Outlet, NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Today', icon: '🌅' },
  { to: '/browse', label: 'Browse', icon: '📋' },
  { to: '/journal', label: 'Journal', icon: '📔' },
  { to: '/settings', label: 'Workshop', icon: '🔧' },
];

export default function AppShell() {
  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <main className="relative flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <nav
        className="flex shrink-0 items-center justify-around border-t px-4 pb-2 pt-1"
        style={{
          borderColor: 'hsl(var(--border))',
          backgroundColor: 'hsl(var(--card))',
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex flex-col items-center gap-0.5 no-underline transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive
                ? 'hsl(var(--foreground))'
                : 'hsl(var(--muted-foreground))',
              opacity: isActive ? 1 : 0.6,
            })}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium tracking-wide uppercase">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
