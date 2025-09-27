"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  HomeIcon,
  MusicalNoteIcon,
  FolderIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userNavigation = [
    { name: "Create Music", href: "/dashboard", icon: MusicalNoteIcon },
    { name: "My Library", href: "/dashboard/library", icon: FolderIcon },
    { name: "Buy Credits", href: "/dashboard/credits", icon: CreditCardIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
  ];

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: ChartBarIcon },
    { name: "User Management", href: "/admin/users", icon: UsersIcon },
    { name: "Song Management", href: "/admin/songs", icon: MusicalNoteIcon },
    { name: "Content Management", href: "/admin/content", icon: DocumentTextIcon },
    { name: "Admin Settings", href: "/admin/settings", icon: Cog6ToothIcon },
  ];

  const isAdmin = session?.user?.role === "ADMIN";
  const allNavigation = isAdmin ? [...userNavigation, ...adminNavigation] : userNavigation;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-tuneforge-gradient rounded-lg flex items-center justify-center">
                <MusicalNoteIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TuneForge</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-tuneforge-gradient text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white font-medium">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-tuneforge-gradient rounded-lg flex items-center justify-center">
                <MusicalNoteIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TuneForge</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-tuneforge-gradient text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white font-medium">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
                {session?.user?.role && (
                  <p className="text-xs text-tuneforge-blue-violet font-medium">{session.user.role} Plan</p>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            TuneForge Dashboard
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
