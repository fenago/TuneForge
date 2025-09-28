"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface Song {
  id: string;
  title: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  tags: string;
  createdAt: string;
  duration: number;
  model: string;
  audioUrl: string;
  imageUrl?: string;
  status: "active" | "flagged" | "removed";
  plays: number;
  downloads: number;
}

export default function AdminSongsPage() {
  const { data: session } = useSession();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<keyof Song>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSongs: 0,
    activeSongs: 0,
    flaggedSongs: 0,
    totalPlays: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const songsPerPage = 10;

  // Fetch real songs from API
  useEffect(() => {
    fetchSongs();
  }, [currentPage, searchTerm, statusFilter, genreFilter, sortBy, sortOrder]);

  const fetchSongs = async () => {
    try {
      setError(null);
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: songsPerPage.toString(),
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (genreFilter !== 'all') params.append('genre', genreFilter);

      console.log('🎵 ADMIN: Fetching songs from API...');
      const response = await fetch(`/api/admin/songs?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ADMIN: Received songs:', data.songs?.length || 0);
        setSongs(data.songs || []);
        setStats(data.stats || { totalSongs: 0, activeSongs: 0, flaggedSongs: 0, totalPlays: 0 });
        setTotalPages(data.pagination?.totalPages || 1);
      } else if (response.status === 403) {
        console.log('❌ ADMIN: Access denied');
        setError('You do not have permission to access song management.');
        setSongs([]);
      } else {
        console.error('❌ ADMIN: Failed to fetch songs:', response.status);
        setError('Failed to load songs. Please try again.');
        setSongs([]);
      }
    } catch (error) {
      console.error('❌ ADMIN: Error fetching songs:', error);
      setError('An error occurred while loading songs.');
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access song management.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Server-side filtering and pagination - songs are already filtered and paginated
  const paginatedSongs = songs;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      flagged: "bg-yellow-100 text-yellow-800",
      removed: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleSort = (field: keyof Song) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePlay = (songId: string) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
    }
  };

  const handleSongAction = async (songId: string, action: string) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    // Get confirmation for destructive actions
    let confirmMessage = '';
    switch (action) {
      case 'flag':
        confirmMessage = `Are you sure you want to flag "${song.title}"? This will mark it for review.`;
        break;
      case 'remove':
        confirmMessage = `Are you sure you want to remove "${song.title}"? This will hide it from users but keep it in the database.`;
        break;
      case 'delete':
        confirmMessage = `⚠️ WARNING: Are you sure you want to permanently delete "${song.title}"? This action cannot be undone and will completely remove the song from the database.`;
        break;
    }

    if (confirmMessage && !confirm(confirmMessage)) {
      return;
    }

    try {
      if (action === 'delete') {
        const response = await fetch(`/api/admin/songs/${songId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state and refresh stats
          setSongs(prev => prev.filter(s => s.id !== songId));
          fetchSongs(); // Refresh to get updated stats
        } else {
          throw new Error('Failed to delete song');
        }
      } else {
        // Flag, unflag, remove, restore actions
        const response = await fetch(`/api/admin/songs/${songId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });

        if (response.ok) {
          const data = await response.json();
          // Update local state
          setSongs(prev => prev.map(s => 
            s.id === songId ? { ...s, status: data.song.status } : s
          ));
          // Refresh to get updated stats
          fetchSongs();
        } else {
          throw new Error(`Failed to ${action} song`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing song:`, error);
      alert(`Failed to ${action} song. Please try again.`);
    }
  };

  const genres = ["all", "pop", "rock", "electronic", "jazz", "classical", "hip-hop", "country", "folk"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Song Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all generated songs</p>
          </div>
          <button 
            onClick={fetchSongs}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Total Songs</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSongs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Active Songs</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeSongs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Flagged Songs</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.flaggedSongs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">Total Plays</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalPlays}</p>
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
                placeholder="Search songs by title, user, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="removed">Removed</option>
            </select>

            {/* Genre Filter */}
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Songs Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading songs...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Songs</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchSongs}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : paginatedSongs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">🎵</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Songs Found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || genreFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No songs have been generated yet"
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
                        Song
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("createdAt")}
                      >
                        Created {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("plays")}
                      >
                        Plays {sortBy === "plays" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("downloads")}
                      >
                        Downloads {sortBy === "downloads" && (sortOrder === "asc" ? "↑" : "↓")}
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
                    {paginatedSongs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative">
                              {song.imageUrl ? (
                                <img 
                                  src={song.imageUrl} 
                                  alt={song.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-tuneforge-gradient rounded-lg flex items-center justify-center">
                                  <PlayIcon className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <button
                                onClick={() => handlePlay(song.id)}
                                className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              >
                                {currentlyPlaying === song.id ? (
                                  <PauseIcon className="w-4 h-4 text-white" />
                                ) : (
                                  <PlayIcon className="w-4 h-4 text-white" />
                                )}
                              </button>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{song.title}</div>
                              <div className="text-sm text-gray-500">{song.tags}</div>
                              <div className="text-xs text-gray-400">
                                {formatDuration(song.duration)} • {song.model}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{song.user.name}</div>
                          <div className="text-sm text-gray-500">{song.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(song.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {song.plays}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {song.downloads}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(song.status)}`}>
                            {song.status === "flagged" && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                            {song.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePlay(song.id)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Play/Pause"
                            >
                              {currentlyPlaying === song.id ? (
                                <PauseIcon className="w-4 h-4" />
                              ) : (
                                <PlayIcon className="w-4 h-4" />
                              )}
                            </button>
                            <a
                              href={song.audioUrl}
                              download={`${song.title}.mp3`}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </a>
                            {song.status === "active" && (
                              <button
                                onClick={() => handleSongAction(song.id, "flag")}
                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                title="Flag Song"
                              >
                                🚩
                              </button>
                            )}
                            {song.status === "flagged" && (
                              <button
                                onClick={() => handleSongAction(song.id, "unflag")}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Unflag Song"
                              >
                                ✅
                              </button>
                            )}
                            {song.status !== "removed" && (
                              <button
                                onClick={() => handleSongAction(song.id, "remove")}
                                className="text-orange-600 hover:text-orange-900 p-1"
                                title="Remove Song"
                              >
                                🚫
                              </button>
                            )}
                            {song.status === "removed" && (
                              <button
                                onClick={() => handleSongAction(song.id, "restore")}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Restore Song"
                              >
                                ↩️
                              </button>
                            )}
                            <button
                              onClick={() => handleSongAction(song.id, "delete")}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Permanently"
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

              {/* Audio Player for currently playing song */}
              {currentlyPlaying && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Now Playing: {paginatedSongs.find(s => s.id === currentlyPlaying)?.title}
                    </span>
                    <button
                      onClick={() => setCurrentlyPlaying(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <audio 
                    controls 
                    className="w-full"
                    autoPlay
                    onEnded={() => setCurrentlyPlaying(null)}
                  >
                    <source src={paginatedSongs.find(s => s.id === currentlyPlaying)?.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

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
                        Showing <span className="font-medium">{((currentPage - 1) * songsPerPage) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * songsPerPage, stats.totalSongs)}
                        </span>{' '}
                        of <span className="font-medium">{stats.totalSongs}</span> results
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
