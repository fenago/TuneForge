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
import UserDetailModal from "@/components/UserDetailModal";
import EditUserModal from "@/components/EditUserModal";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [userDetailModal, setUserDetailModal] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({ isOpen: false, userId: null });
  
  const [editUserModal, setEditUserModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: (() => void) | null;
    confirmText: string;
    confirmColor: 'red' | 'blue' | 'green' | 'orange';
    loading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    confirmText: 'Confirm',
    confirmColor: 'red',
    loading: false
  });

  const usersPerPage = 10;

  // Fetch real users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      console.log('👥 ADMIN: Fetching users from API...');
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ADMIN: Received users:', data.users?.length || 0);
        setUsers(data.users || []);
      } else if (response.status === 403) {
        console.log('❌ ADMIN: Access denied');
        setError('You do not have permission to access user management.');
        setUsers([]);
      } else {
        console.error('❌ ADMIN: Failed to fetch users:', response.status);
        setError('Failed to load users. Please try again.');
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ ADMIN: Error fetching users:', error);
      setError('An error occurred while loading users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

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
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case "view":
        setUserDetailModal({ isOpen: true, userId });
        break;
        
      case "edit":
        setEditUserModal({ isOpen: true, user });
        break;
        
      case "suspend":
        setConfirmDialog({
          isOpen: true,
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${user.name}?\n\nThis will:\n• Prevent the user from accessing their account\n• Stop all active music generation\n• Require admin action to reactivate`,
          confirmText: 'Suspend User',
          confirmColor: 'orange',
          loading: false,
          action: () => performUserAction(userId, 'suspend')
        });
        break;
        
      case "activate":
        setConfirmDialog({
          isOpen: true,
          title: 'Activate User',
          message: `Are you sure you want to activate ${user.name}?\n\nThis will restore full account access.`,
          confirmText: 'Activate User',
          confirmColor: 'green',
          loading: false,
          action: () => performUserAction(userId, 'activate')
        });
        break;
        
      case "delete":
        setConfirmDialog({
          isOpen: true,
          title: 'Delete User',
          message: `⚠️ WARNING: This action cannot be undone!\n\nDeleting ${user.name} will:\n• Permanently delete their account\n• Delete all their songs (${user.songsGenerated} songs)\n• Remove all associated data\n\nAre you absolutely sure?`,
          confirmText: 'Delete User',
          confirmColor: 'red',
          loading: false,
          action: () => performUserAction(userId, 'delete')
        });
        break;
    }
  };

  const performUserAction = async (userId: string, action: string) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      if (action === 'delete') {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setUsers(prev => prev.filter(user => user.id !== userId));
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } else {
          throw new Error('Failed to delete user');
        }
      } else {
        // Suspend or activate
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(prev => prev.map(user => 
            user.id === userId ? data.user : user
          ));
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } else {
          throw new Error(`Failed to ${action} user`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user. Please try again.`);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
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
          <div className="flex gap-2">
            <button 
              onClick={fetchUsers}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <UserPlusIcon className="w-4 h-4" />
              Add User
            </button>
          </div>
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
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Users</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No users have signed up yet"
                }
              </p>
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

        {/* Modals */}
        <UserDetailModal
          isOpen={userDetailModal.isOpen}
          onClose={() => setUserDetailModal({ isOpen: false, userId: null })}
          userId={userDetailModal.userId}
        />

        <EditUserModal
          isOpen={editUserModal.isOpen}
          onClose={() => setEditUserModal({ isOpen: false, user: null })}
          user={editUserModal.user}
          onUserUpdated={handleUserUpdated}
        />

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.action || (() => {})}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          confirmColor={confirmDialog.confirmColor}
          loading={confirmDialog.loading}
        />
      </div>
    </DashboardLayout>
  );
}
