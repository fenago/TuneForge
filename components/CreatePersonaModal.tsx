"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, UserCircleIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { validatePersonaInput, getPersonaTemplates } from "@/utils/personaValidation";

interface Song {
  id: string;
  title: string;
  clipId: string;
  duration: number;
  genre: string;
  tags: string[];
  createdAt: string;
  files: {
    audioUrl?: string;
    thumbnailUrl?: string;
  };
}

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonaCreated: (persona: any) => void;
}

export default function CreatePersonaModal({
  isOpen,
  onClose,
  onPersonaCreated
}: CreatePersonaModalProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [personaName, setPersonaName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Song, 2: Configure Persona
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchSongs();
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep(1);
    setSelectedSong(null);
    setPersonaName("");
    setDescription("");
    setValidationErrors([]);
  };

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs/list');
      if (response.ok) {
        const data = await response.json();
        setSongs(data.songs || []);
      }
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    if (!personaName) {
      setPersonaName(`${song.title} Voice`);
    }
    setStep(2);
  };

  const handleCreatePersona = async () => {
    if (!selectedSong) return;

    // Validate input
    const validation = validatePersonaInput({
      name: personaName,
      description: description,
      sourceClipId: selectedSong.clipId
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);

    try {
      setCreating(true);
      
      const response = await fetch('/api/personas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personaName.trim(),
          description: description.trim(),
          sourceClipId: selectedSong.clipId,
          sourceSongTitle: selectedSong.title
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onPersonaCreated(data.persona);
        onClose();
      } else {
        const errorData = await response.json();
        setValidationErrors([errorData.error || 'Failed to create persona']);
      }
    } catch (error) {
      console.error('Failed to create persona:', error);
      setValidationErrors(['Failed to create persona. Please try again.']);
    } finally {
      setCreating(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setDescription(template);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <UserCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
            Create Voice Persona
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={creating}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span>Select Source Song</span>
            </div>
            <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span>Configure Persona</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose a Source Song
                </h3>
                <p className="text-gray-600">
                  Select one of your existing songs to create a persona from its vocal style
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading your songs...</p>
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-8">
                  <MicrophoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    You need at least one song to create a persona.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Generate some songs first, then come back to create personas!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => handleSongSelect(song)}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      {song.files.thumbnailUrl && (
                        <img
                          src={song.files.thumbnailUrl}
                          alt={song.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {song.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {song.genre} • {formatDuration(song.duration)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {song.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedSong && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configure Your Persona
                </h3>
                <p className="text-gray-600">
                  Define the characteristics of your voice persona
                </p>
              </div>

              {/* Selected Song Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-medium text-gray-900 mb-2">Source Song</h4>
                <div className="flex items-center space-x-3">
                  {selectedSong.files.thumbnailUrl && (
                    <img
                      src={selectedSong.files.thumbnailUrl}
                      alt={selectedSong.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{selectedSong.title}</p>
                    <p className="text-sm text-gray-500">
                      {selectedSong.genre} • {formatDuration(selectedSong.duration)}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change Song
                  </button>
                </div>
              </div>

              {/* Persona Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona Name *
                </label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="e.g., My Rock Voice, Smooth Singer, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {personaName.length}/50 characters
                </p>
              </div>

              {/* Description Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getPersonaTemplates(selectedSong?.genre).map((template: { label: string; value: string }, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTemplateSelect(template.value)}
                      className="text-left p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-sm transition-colors"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the vocal style, tone, energy, and characteristics you want to capture..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/200 characters
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  💡 Be specific about vocal characteristics: tone, energy, style, gender, etc.
                </p>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-800">
                    {validationErrors.map((error, index) => (
                      <p key={index}>• {error}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreatePersona}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Persona...</span>
                    </div>
                  ) : (
                    'Create Persona'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-gray-50 border-t text-xs text-gray-500">
          <div className="space-y-1">
            <p>🎤 Personas capture the vocal style and characteristics from your songs</p>
            <p>⏱️ Creating a persona may take a few moments to process</p>
            <p>🔄 You can use the same persona for multiple future songs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
