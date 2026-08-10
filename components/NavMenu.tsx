'use client';

import { useEffect, useRef, useState } from 'react';
import { MenuIcon } from '@/components/icons';

interface NavItem {
  href: string;
  label: string;
}

export function NavMenu({
  items,
  logoutLabel,
  logoutAction
}: {
  items: NavItem[];
  logoutLabel: string;
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="menu"
        className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
      >
        <MenuIcon />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {item.label}
            </a>
          ))}
          <form action={logoutAction} className="border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              {logoutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
