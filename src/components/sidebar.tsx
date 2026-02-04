'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PanelLeftClose,
  PanelLeft,
  Home,
  MousePointer,
  Sparkles,
  ArrowUpRight,
  Target,
  AlertTriangle,
  FlaskConical,
  Bell,
  Layers,
  Github,
} from 'lucide-react';

type SidebarContextType = {
  isCollapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = () => setIsCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarContext.Provider>
  );
}

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    description: 'Overview',
  },
  {
    href: '/tooltip-demo',
    label: 'Tooltip Demo',
    icon: MousePointer,
    description: 'Basic tooltip positioning',
  },
  {
    href: '/animations-demo',
    label: 'Animations',
    icon: Sparkles,
    description: 'Dropdown animations',
  },
  {
    href: '/arrows-demo',
    label: 'Arrows',
    icon: ArrowUpRight,
    description: 'Popover arrows',
  },
  {
    href: '/toast-demo',
    label: 'Toast',
    icon: Bell,
    description: 'Toast notifications',
  },
  {
    href: '/popover-auto-demo',
    label: 'Popover Auto',
    icon: Layers,
    description: 'Nested popovers & light dismiss',
  },
  {
    href: '/fallback-test',
    label: 'Fallback Test',
    icon: Target,
    description: 'JS fallback positioning',
  },
];

function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col border-r border-gray-200 bg-gray-50 transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-blue-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Anchor Lab
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className={`rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Warning Banner */}
      {!isCollapsed && (
        <div className="mx-3 mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs text-amber-700 dark:text-amber-400">
              <strong className="font-semibold">Not Production Code</strong>
              <p className="mt-0.5 opacity-90">
                This project is exclusively vibe coded for experimentation.
              </p>
            </div>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="mx-auto mt-3" title="Not production code - vibe coded">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <a
          href="https://github.com/alexreardon/anchor-position-fallback-test"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'View on GitHub' : undefined}
        >
          <Github className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm">View on GitHub</span>}
        </a>
      </div>
    </aside>
  );
}

export { useSidebar };
