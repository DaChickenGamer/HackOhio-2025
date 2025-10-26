import { type Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'HackOhio 2025',
  description: 'For HackOhio 2025',
};

const HeaderButton = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${className}`}
  >
    {children}
  </button>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
        >
          <header className="flex justify-between items-center p-4 sm:p-6 shadow-md bg-white">
            <div className="text-xl font-semibold">HackOhio 2025</div>

            <div className="flex items-center gap-3 sm:gap-4">
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
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>

          <main className="min-h-screen p-4 sm:p-6">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
