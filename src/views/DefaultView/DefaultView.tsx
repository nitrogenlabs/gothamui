/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {memo, useState} from 'react';
import {useNavigate} from 'react-router';

const navItems = [
  {label: 'Home', path: '/'},
  {label: 'About', path: '/about'},
  {label: 'Contact', path: '/contact'}
];

export interface DefaultViewProps {
  children?: React.ReactNode;
  title?: string;
}

const DefaultViewComponent: React.FC<DefaultViewProps> = ({
  children,
  title = 'GothamUI'
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                aria-controls="mobile-menu"
                aria-expanded={mobileOpen}
                className="cursor-pointer inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={handleDrawerToggle}
                type="button"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  aria-hidden="true"
                  className={`${mobileOpen ? 'hidden' : 'block'} h-6 w-6`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  aria-hidden="true"
                  className={`${mobileOpen ? 'block' : 'hidden'} h-6 w-6`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">{title}</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                {navItems.map(({label, path}) => (
                  <button
                    className="cursor-pointer text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                    key={path}
                    onClick={() => handleNavigation(path)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`${mobileOpen ? 'block' : 'hidden'} sm:hidden`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({label, path}) => (
              <button
                className="cursor-pointer text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                key={path}
                onClick={() => handleNavigation(path)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        {children}
      </main>
    </div>
  );
};

export const DefaultView = memo(DefaultViewComponent);
DefaultView.displayName = 'DefaultView';
