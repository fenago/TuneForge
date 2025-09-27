"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/#features",
    label: "Features",
  },
  {
    href: "/#pricing",
    label: "Pricing",
  },
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/#contact",
    label: "Contact",
  },
];

// TuneForge Header: Fixed header with transparent background that becomes opaque on scroll
const Header = () => {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Handle scroll effect for background opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // setIsOpen(false) when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container flex items-center justify-between px-6 py-4 mx-auto">
        {/* TuneForge Logo */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-3 shrink-0"
            href="/"
            title="TuneForge homepage"
          >
            <Image
              src="/tuneforge_logo.png"
              alt="TuneForge logo"
              className="h-8 w-auto"
              width={120}
              height={32}
              priority={true}
            />
          </Link>
        </div>

        {/* Burger button for mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-900 hover:text-tuneforge-blue-violet transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links - Center */}
        <div className="hidden lg:flex lg:justify-center lg:gap-8 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="font-inter text-gray-900 hover:text-tuneforge-blue-violet transition-colors duration-200 relative group font-medium"
              title={link.label}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-tuneforge-gradient group-hover:w-full transition-all duration-200"></span>
            </Link>
          ))}
        </div>

        {/* Authentication Buttons - Right */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1 lg:gap-4 lg:items-center">
          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              {/* User Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 font-inter text-gray-900 hover:text-tuneforge-blue-violet transition-colors duration-200 font-medium">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Account"}
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <span>{session.user?.name || "Account"}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm font-inter text-gray-700 hover:bg-gray-50 hover:text-tuneforge-blue-violet transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm font-inter text-gray-700 hover:bg-gray-50 hover:text-tuneforge-blue-violet transition-colors"
                    >
                      My Profile
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm font-inter text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="font-inter text-gray-900 hover:text-tuneforge-blue-violet transition-colors duration-200 font-medium"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-inter font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)}></div>
        <div className="fixed inset-y-0 right-0 z-10 w-full px-6 py-4 overflow-y-auto bg-tuneforge-dark-blue sm:max-w-sm transform origin-right transition ease-in-out duration-300">
          {/* Mobile header */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-3 shrink-0"
              title="TuneForge homepage"
              href="/"
            >
              <Image
                src="/tuneforge_logo.png"
                alt="TuneForge logo"
                className="h-8 w-auto"
                width={120}
                height={32}
                priority={true}
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white hover:text-tuneforge-medium-purple transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile navigation links */}
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="font-inter text-white hover:text-tuneforge-medium-purple transition-colors text-lg"
                    title={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-tuneforge-medium-gray/30 my-4"></div>
            {/* Mobile authentication buttons */}
            <div className="flex flex-col gap-3">
              {status === "authenticated" ? (
                <>
                  {/* Mobile User Profile */}
                  <div className="flex items-center gap-3 mb-4">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Account"}
                        className="w-10 h-10 rounded-full"
                        width={40}
                        height={40}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white font-medium">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <p className="font-inter text-white font-medium">{session.user?.name || "User"}</p>
                      <p className="font-inter text-tuneforge-medium-purple text-sm">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Mobile Menu Links */}
                  <Link
                    href="/dashboard"
                    className="block font-inter text-white hover:text-tuneforge-medium-purple transition-colors text-lg py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block font-inter text-white hover:text-tuneforge-medium-purple transition-colors text-lg py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  
                  {/* Mobile Sign Out */}
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="block font-inter text-white hover:text-red-400 transition-colors text-lg text-left py-2 mt-2 border-t border-tuneforge-medium-purple/30 pt-4"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="font-inter text-white hover:text-tuneforge-medium-purple transition-colors text-lg"
                  >
                    Login
                  </Link>
                  <Link
                    href="/login"
                    className="bg-tuneforge-gradient text-white font-inter font-medium px-6 py-3 rounded-lg text-center transition-all duration-200 hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
