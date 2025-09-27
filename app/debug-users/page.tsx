"use client";

import { useState, useEffect } from "react";

export default function DebugUsersPage() {
  const [users, setUsers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/debug/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const forceUpdateRole = async () => {
    setIsLoading(true);
    setUpdateResult(null);

    try {
      const response = await fetch('/api/debug/users', {
        method: 'POST',
      });
      const data = await response.json();
      setUpdateResult(data);
      
      if (data.success) {
        await loadUsers(); // Reload users
      }
    } catch (error) {
      setUpdateResult({
        success: false,
        error: 'Failed to update',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Debug - Users</h1>

        {users && (
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">Summary</h2>
              <p><strong>Total Users:</strong> {users.totalUsers}</p>
              <p><strong>Target User Found:</strong> {users.targetUser ? 'YES' : 'NO'}</p>
            </div>

            {users.targetUser && (
              <div className="bg-blue-50 p-4 rounded border">
                <h2 className="text-xl font-semibold mb-2">Target User (learningscienceai1@gmail.com)</h2>
                <pre className="text-sm bg-white p-3 rounded overflow-auto">
                  {JSON.stringify(users.targetUser, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">All Users</h2>
              {users.allUsers.map((user: any, index: number) => (
                <div key={index} className="mb-4 p-3 bg-white rounded border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Name:</strong> {user.name}</div>
                    <div><strong>Role:</strong> <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'MAX' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'PAID' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>{user.role}</span></div>
                    <div><strong>Plan:</strong> {user.subscription?.plan || 'N/A'}</div>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600">Show Full Details</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>

            <div className="bg-red-50 p-4 rounded border border-red-200">
              <h2 className="text-xl font-semibold mb-2 text-red-800">Force Update Role</h2>
              <p className="text-red-700 mb-4">This will force update learningscienceai1@gmail.com to ADMIN role</p>
              <button
                onClick={forceUpdateRole}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'FORCE UPDATE TO ADMIN'}
              </button>
            </div>

            {updateResult && (
              <div className={`p-4 rounded border ${
                updateResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  {updateResult.success ? '✅ Success' : '❌ Error'}
                </h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(updateResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
