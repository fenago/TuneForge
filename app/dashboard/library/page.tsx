"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import SongMetadataView from "@/components/SongMetadataView";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { 
  PlayIcon, 
  PauseIcon,
  ArrowDownTrayIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

interface Song {
  _id: string;
  title: string;
  description?: string;
  genre: string;
  mood: string;
  duration: number;
  prompt: string;
  aiModel: string;
  generationParams?: {
    style?: string;
    tempo?: number;
    key?: string;
    instruments?: string[];
  };
  files: {
    audioUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    fileFormats?: {
      audio?: string;
      video?: string;
      thumbnail?: string;
    };
    fileSizes?: {
      audio?: number;
      video?: number;
      thumbnail?: number;
    };
    quality?: {
      audioBitrate?: number;
      videoResolution?: string;
      thumbnailDimensions?: {
        width?: number;
        height?: number;
      };
    };
  };
  status: string;
  isPublic: boolean;
  tags: string[];
  playCount: number;
  downloadCount: number;
  shareCount: number;
  taskId?: string;
  clipId?: string;
  lyrics?: string;
  originalCreatedAt?: string;
  generationTime?: number;
  generationAnalytics?: {
    pollingAttempts?: number;
    totalWaitTime?: number;
    apiResponseCode?: number;
    apiResponseTime?: number;
  };
  musicAnalysis?: {
    energy?: number;
    valence?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    liveness?: number;
    speechiness?: number;
    genreConfidence?: number;
    moodConfidence?: number;
    loudness?: number;
    modality?: number;
    timeSignature?: number;
  };
  createdAt: string;
  updatedAt: string;
  // Backwards compatibility
  id: string;
  audioUrl: string;
  imageUrl?: string;
  model: string;
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    songId: string | null;
    songTitle: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    songId: null,
    songTitle: '',
    isDeleting: false
  });

  // Fetch real songs from database
  useEffect(() => {
    checkPendingSongs();
    fetchSongs();
  }, []);

  const checkPendingSongs = async () => {
    try {
      const response = await fetch('/api/music/check-pending', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.completed > 0) {
          console.log(`✅ Recovered ${result.completed} songs from previous sessions!`);
          // Refresh the song list if songs were recovered
          fetchSongs();
        }
      }
    } catch (error) {
      console.error('Failed to check pending songs:', error);
    }
  };

  const fetchSongs = async () => {
    try {
      console.log('📚 LIBRARY: Fetching songs from database...');
      const response = await fetch('/api/songs/list', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 LIBRARY: Received songs data:', JSON.stringify(data, null, 2));
        console.log('📚 LIBRARY: Songs array:', data.songs);
        console.log('📚 LIBRARY: Songs count:', data.songs?.length || 0);
        setSongs(data.songs || []);
      } else {
        const errorText = await response.text();
        console.error('📚 LIBRARY: Failed to fetch songs:', response.status, errorText);
        setSongs([]);
      }
    } catch (error) {
      console.error('📚 LIBRARY: Error fetching songs:', error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(song => {
    const tagsString = Array.isArray(song.tags) ? song.tags.join(', ').toLowerCase() : '';
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tagsString.includes(searchTerm.toLowerCase()) ||
                         (song.genre && song.genre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (song.mood && song.mood.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre = selectedGenre === "all" || 
                        (song.genre && song.genre.toLowerCase().includes(selectedGenre)) ||
                        tagsString.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePlay = (songId: string) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
    }
  };

  const handleDeleteClick = (songId: string, songTitle: string) => {
    setDeleteModal({
      isOpen: true,
      songId,
      songTitle,
      isDeleting: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.songId) return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      console.log('🗑️ LIBRARY: Deleting song:', deleteModal.songId);
      const response = await fetch('/api/songs/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId: deleteModal.songId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ LIBRARY: Song deleted successfully:', data);
        
        // Remove from local state
        setSongs(songs.filter(song => song.id !== deleteModal.songId && song._id !== deleteModal.songId));
        
        // Close modal
        setDeleteModal({
          isOpen: false,
          songId: null,
          songTitle: '',
          isDeleting: false
        });
        
        // Stop playing if this song was playing
        if (currentlyPlaying === deleteModal.songId) {
          setCurrentlyPlaying(null);
        }
        
      } else {
        const errorData = await response.json();
        console.error('❌ LIBRARY: Failed to delete song:', errorData);
        alert(`Failed to delete song: ${errorData.error || 'Unknown error'}`);
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('❌ LIBRARY: Error deleting song:', error);
      alert('Failed to delete song. Please try again.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      songId: null,
      songTitle: '',
      isDeleting: false
    });
  };

  const genres = ["all", "pop", "jazz", "electronic", "rock", "hip-hop", "classical"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-600 mt-2">Manage and organize your created music</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search songs by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Genre Filter */}
            <div className="relative">
              <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your music library...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="p-8 text-center">
              <PlayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedGenre !== "all" ? "No songs found" : "No songs yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedGenre !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first song to get started!"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSongs.map((song) => (
                <div key={song.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {/* Enhanced Song Display with Metadata */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Album Art / Play Button */}
                    <div className="relative flex-shrink-0">
                      {song.imageUrl || song.files?.thumbnailUrl ? (
                        <img 
                          src={song.imageUrl || song.files?.thumbnailUrl} 
                          alt={song.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-tuneforge-gradient rounded-lg flex items-center justify-center">
                          <PlayIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => handlePlay(song.id)}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        {currentlyPlaying === song.id ? (
                          <PauseIcon className="w-6 h-6 text-white" />
                        ) : (
                          <PlayIcon className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handlePlay(song.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Play/Pause"
                      >
                        {currentlyPlaying === song.id ? (
                          <PauseIcon className="w-5 h-5" />
                        ) : (
                          <PlayIcon className="w-5 h-5" />
                        )}
                      </button>
                      
                      <a
                        href={song.audioUrl || song.files?.audioUrl}
                        download={`${song.title}.mp3`}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </a>
                      
                      <button
                        onClick={() => handleDeleteClick(song.id, song.title)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* New Comprehensive Metadata View */}
                  <SongMetadataView song={song} />

                  {/* Audio Player (when playing) */}
                  {currentlyPlaying === song.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <audio 
                        controls 
                        className="w-full"
                        autoPlay
                        onEnded={() => setCurrentlyPlaying(null)}
                      >
                        <source src={song.audioUrl || song.files?.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && songs.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{songs.length}</p>
                <p className="text-sm text-gray-600">Total Songs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(songs.reduce((acc, song) => acc + song.duration, 0) / 60)}m
                </p>
                <p className="text-sm text-gray-600">Total Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(songs.flatMap(song => Array.isArray(song.tags) ? song.tags : [])).size}
                </p>
                <p className="text-sm text-gray-600">Unique Tags</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {songs.filter(song => {
                    const dayAgo = new Date();
                    dayAgo.setDate(dayAgo.getDate() - 1);
                    return new Date(song.createdAt) > dayAgo;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Created Today</p>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          songTitle={deleteModal.songTitle}
          isDeleting={deleteModal.isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
