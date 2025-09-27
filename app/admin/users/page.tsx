"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  role: "FREE" | "PAID" | "MAX" | "ADMIN";
  signupDate: string;
  totalSpent: number;
  songsGenerated: number;
  lastActive: string;
  status: "active" | "suspended" | "inactive";
  avatar?: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof User>("signupDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const usersPerPage = 10;

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    setTimeout(() => {
      setUsers([
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "PAID",
          signupDate: "2024-01-15T10:30:00Z",
          totalSpent: 49.99,
          songsGenerated: 23,
          lastActive: "2024-01-20T14:22:00Z",
          status: "active"
        },
        {
          id: "2",
          name: "Sarah Wilson",
          email: "sarah@example.com",
          role: "FREE",
          signupDate: "2024-01-18T09:15:00Z",
          totalSpent: 0,
          songsGenerated: 5,
          lastActive: "2024-01-19T11:45:00Z",
          status: "active"
        },
        {
          id: "3",
          name: "Mike Johnson",
          email: "mike@example.com",
          role: "MAX",
          signupDate: "2024-01-10T16:20:00Z",
          totalSpent: 199.99,
          songsGenerated: 87,
          lastActive: "2024-01-21T08:30:00Z",
          status: "active"
        },
        {
          id: "4",
          name: "Emma Davis",
          email: "emma@example.com",
          role: "ADMIN",
          signupDate: "2024-01-05T12:00:00Z",
          totalSpent: 0,
          songsGenerated: 156,
          lastActive: "2024-01-21T16:15:00Z",
          status: "active"
        },
        {
          id: "5",
          name: "Alex Brown",
          email: "alex@example.com",
          role: "PAID",
          signupDate: "2024-01-12T14:45:00Z",
          totalSpent: 24.99,
          songsGenerated: 12,
          lastActive: "2024-01-18T10:20:00Z",
          status: "suspended"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (session?.user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access user management.</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      FREE: "bg-gray-100 text-gray-800",
      PAID: "bg-blue-100 text-blue-800",
      MAX: "bg-purple-100 text-purple-800",
      ADMIN: "bg-red-100 text-red-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleSort = (field: keyof User) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    switch (action) {
      case "view":
        // Navigate to user detail page
        console.log("View user:", userId);
        break;
      case "edit":
        // Open edit modal or navigate to edit page
        console.log("Edit user:", userId);
        break;
      case "suspend":
        if (confirm("Are you sure you want to suspend this user?")) {
          setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, status: "suspended" as const } : user
          ));
        }
        break;
      case "activate":
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: "active" as const } : user
        ));
        break;
      case "delete":
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
          setUsers(prev => prev.filter(user => user.id !== userId));
        }
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage and monitor user accounts</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlusIcon className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Paid Users</h3>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === "PAID" || u.role === "MAX").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">
              ${users.reduce((acc, u) => acc + u.totalSpent, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
              <option value="MAX">Max</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("role")}
                      >
                        Role {sortBy === "role" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("signupDate")}
                      >
                        Signup Date {sortBy === "signupDate" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("totalSpent")}
                      >
                        Total Spent {sortBy === "totalSpent" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("songsGenerated")}
                      >
                        Songs {sortBy === "songsGenerated" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-tuneforge-gradient rounded-full flex items-center justify-center text-white font-medium">
                                {user.name.charAt(0)}
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(user.signupDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${user.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.songsGenerated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUserAction(user.id, "view")}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, "edit")}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Edit User"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            {user.status === "active" ? (
                              <button
                                onClick={() => handleUserAction(user.id, "suspend")}
                                className="text-orange-600 hover:text-orange-900 p-1"
                                title="Suspend User"
                              >
                                ⏸️
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, "activate")}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Activate User"
                              >
                                ▶️
                              </button>
                            )}
                            <button
                              onClick={() => handleUserAction(user.id, "delete")}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete User"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(startIndex + usersPerPage, sortedUsers.length)}
                        </span>{' '}
                        of <span className="font-medium">{sortedUsers.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
