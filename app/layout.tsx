'use client';

import { type ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const HeaderButton = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-xs sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${className}`}
  >
    {children}
  </button>
);

function RootLayoutContent({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <header className="flex justify-between items-center px-4 py-3 sm:p-6 shadow-md bg-white relative z-50">
          <Link href="/" className="text-lg sm:text-xl font-semibold hover:text-purple-600 transition-colors">
            WebConnect
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            <SignedOut>
              <SignInButton>
                <HeaderButton className="bg-white border border-gray-300 hover:bg-gray-100">
                  Sign In
                </HeaderButton>
              </SignInButton>

              <SignUpButton>
                <HeaderButton className="bg-purple-600 text-white hover:bg-purple-700">
                  Sign Up
                </HeaderButton>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link 
                href="/graph" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
              >
                Graph
              </Link>
              <Link 
                href="/settings" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
              >
                Settings
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="sm:hidden flex items-center gap-3">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col justify-between w-6 h-5 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span
                className={`block w-full h-0.5 bg-gray-700 transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              ></span>
              <span
                className={`block w-full h-0.5 bg-gray-700 transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`block w-full h-0.5 bg-gray-700 transition-all duration-300 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              ></span>
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200">
              <div className="flex flex-col p-4 space-y-3">
                <SignedOut>
                  <SignInButton>
                    <button className="w-full px-4 py-3 text-left bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors">
                      Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton>
                    <button className="w-full px-4 py-3 text-left bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium text-sm transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Link 
                    href="/graph" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                  >
                    Graph
                  </Link>
                  <Link 
                    href="/settings" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                  >
                    Settings
                  </Link>
                </SignedIn>
              </div>
            </div>
          )}
        </header>

        <main className={pathname === '/graph' ? '' : 'min-h-screen p-4 sm:p-6'}>{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </ClerkProvider>
  );
}
