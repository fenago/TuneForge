"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import ContentEditorModal from "@/components/ContentEditorModal";

interface ContentItem {
  id: string;
  title: string;
  type: "announcement" | "policy" | "faq" | "guide" | "terms";
  content: string;
  status: "published" | "draft" | "archived";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  views: number;
}

export default function ContentManagementPage() {
  const { data: session } = useSession();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch real content from API
  useEffect(() => {
    fetchContent();
  }, [searchTerm, typeFilter, statusFilter]);

  const fetchContent = async () => {
    try {
      setError(null);
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      console.log('📄 ADMIN: Fetching content from API...');
      const response = await fetch(`/api/admin/content?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ADMIN: Received content:', data.content?.length || 0);
        setContent(data.content || []);
        setStats(data.stats || { total: 0, published: 0, draft: 0, totalViews: 0 });
      } else if (response.status === 403) {
        console.log('❌ ADMIN: Access denied');
        setError('You do not have permission to access content management.');
        setContent([]);
      } else {
        console.error('❌ ADMIN: Failed to fetch content:', response.status);
        setError('Failed to load content. Please try again.');
        setContent([]);
      }
    } catch (error) {
      console.error('❌ ADMIN: Error fetching content:', error);
      setError('An error occurred while loading content.');
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access content management.</p>
        </div>
      </DashboardLayout>
    );
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      announcement: "bg-blue-100 text-blue-800",
      policy: "bg-purple-100 text-purple-800", 
      faq: "bg-green-100 text-green-800",
      guide: "bg-yellow-100 text-yellow-800",
      terms: "bg-red-100 text-red-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleContentAction = async (itemId: string, action: string) => {
    const item = content.find(c => c.id === itemId);
    if (!item) return;

    switch (action) {
      case "edit":
        setEditingItem(item);
        break;
        
      case "publish":
        await performContentAction(itemId, 'publish');
        break;
        
      case "archive":
        if (confirm(`Are you sure you want to archive "${item.title}"?\n\nThis will hide it from users but keep it in the system.`)) {
          await performContentAction(itemId, 'archive');
        }
        break;
        
      case "delete":
        if (confirm(`⚠️ WARNING: Are you sure you want to permanently delete "${item.title}"?\n\nThis action cannot be undone and will completely remove the content.`)) {
          await performContentAction(itemId, 'delete');
        }
        break;
    }
  };

  const performContentAction = async (itemId: string, action: string) => {
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const body = action === 'delete' ? undefined : JSON.stringify({ action });

      const response = await fetch(`/api/admin/content/${itemId}`, {
        method,
        headers: action === 'delete' ? {} : { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        if (action === 'delete') {
          setContent(prev => prev.filter(item => item.id !== itemId));
        } else {
          const data = await response.json();
          setContent(prev => prev.map(item => 
            item.id === itemId ? { ...item, status: data.content.status } : item
          ));
        }
        // Refresh stats
        fetchContent();
      } else {
        throw new Error(`Failed to ${action} content`);
      }
    } catch (error) {
      console.error(`Error ${action}ing content:`, error);
      alert(`Failed to ${action} content. Please try again.`);
    }
  };

  const handleContentSave = (result: any) => {
    console.log('Content saved:', result);
    fetchContent(); // Refresh the content list
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Manage announcements, policies, guides, and FAQs</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Content
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Total Content</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Published</h3>
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Draft</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</p>
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
                placeholder="Search content by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="announcement">Announcements</option>
              <option value="policy">Policies</option>
              <option value="faq">FAQs</option>
              <option value="guide">Guides</option>
              <option value="terms">Terms</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading content...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search criteria" : "Create your first content item"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.content.substring(0, 100)}...
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            By {item.createdBy} • {formatDate(item.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleContentAction(item.id, "edit")}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {item.status === "draft" && (
                            <button
                              onClick={() => handleContentAction(item.id, "publish")}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Publish"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === "published" && (
                            <button
                              onClick={() => handleContentAction(item.id, "archive")}
                              className="text-orange-600 hover:text-orange-900 p-1"
                              title="Archive"
                            >
                              📦
                            </button>
                          )}
                          <button
                            onClick={() => handleContentAction(item.id, "delete")}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
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
          )}
        </div>

        {/* Modals */}
        <ContentEditorModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleContentSave}
        />

        <ContentEditorModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleContentSave}
          editingContent={editingItem}
        />
      </div>
    </DashboardLayout>
  );
}
