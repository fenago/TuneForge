"use client";

import { useState, useEffect } from "react";
import { PlusIcon, UserCircleIcon, StarIcon, TrashIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface Persona {
  id: string;
  name: string;
  description: string;
  personaId: string;
  voiceType: 'male' | 'female' | 'mixed' | 'unknown';
  characteristics: string[];
  sourceSongTitle: string;
  usageCount: number;
  isFavorite: boolean;
  status: 'ready' | 'creating' | 'failed';
  displayName: string;
}

interface PersonaSelectorProps {
  selectedPersonaId?: string;
  onPersonaSelect: (personaId: string | null) => void;
  onCreatePersona: () => void;
  disabled?: boolean;
}

export default function PersonaSelector({
  selectedPersonaId,
  onPersonaSelect,
  onCreatePersona,
  disabled = false
}: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/personas/list');
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);
      }
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (personaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const response = await fetch('/api/personas/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPersonas(prev => prev.map(p => 
          p.id === personaId ? { ...p, isFavorite: data.isFavorite } : p
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeletePersona = async (personaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/personas/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId }),
      });
      
      if (response.ok) {
        setPersonas(prev => prev.filter(p => p.id !== personaId));
        if (selectedPersonaId === personaId) {
          onPersonaSelect(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete persona:', error);
    }
  };

  const getVoiceTypeIcon = (voiceType: string) => {
    switch (voiceType) {
      case 'male': return '👨';
      case 'female': return '👩';
      case 'mixed': return '👥';
      default: return '🎤';
    }
  };

  const getCharacteristicColor = (char: string) => {
    const colors: Record<string, string> = {
      'deep': 'bg-purple-100 text-purple-800',
      'high': 'bg-yellow-100 text-yellow-800',
      'smooth': 'bg-green-100 text-green-800',
      'rough': 'bg-red-100 text-red-800',
      'rhythmic': 'bg-blue-100 text-blue-800',
      'melodic': 'bg-pink-100 text-pink-800',
      'powerful': 'bg-orange-100 text-orange-800',
      'soft': 'bg-gray-100 text-gray-800',
      'energetic': 'bg-emerald-100 text-emerald-800',
      'calm': 'bg-indigo-100 text-indigo-800'
    };
    return colors[char] || 'bg-gray-100 text-gray-800';
  };

  const selectedPersona = personas.find(p => p.id === selectedPersonaId);

  if (!isExpanded) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Voice Persona (Advanced Feature)
            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Optional
            </span>
          </label>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            disabled={disabled}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            Configure Persona
          </button>
        </div>

        {selectedPersona ? (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getVoiceTypeIcon(selectedPersona.voiceType)}</span>
              <div>
                <p className="font-medium text-gray-900">{selectedPersona.name}</p>
                <p className="text-sm text-gray-600 truncate max-w-xs">
                  {selectedPersona.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onPersonaSelect(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No persona selected - will use default AI voice
          </div>
        )}

        <div className="text-xs text-gray-500">
          💡 Personas let you create custom voices based on your existing songs
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Voice Persona Selection
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Minimize
        </button>
      </div>

      {/* No Persona Option */}
      <div
        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
          !selectedPersonaId 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onPersonaSelect(null)}
      >
        <div className="flex items-center space-x-3">
          <MicrophoneIcon className="w-6 h-6 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">Default AI Voice</p>
            <p className="text-sm text-gray-600">Use Suno's standard AI vocals</p>
          </div>
        </div>
      </div>

      {/* Existing Personas */}
      {personas.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Your Personas</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPersonaId === persona.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${persona.status !== 'ready' ? 'opacity-50' : ''}`}
                onClick={() => persona.status === 'ready' && onPersonaSelect(persona.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl mt-1">
                      {getVoiceTypeIcon(persona.voiceType)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">
                          {persona.name}
                        </p>
                        {persona.status === 'creating' && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Creating...
                          </span>
                        )}
                        {persona.status === 'failed' && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Failed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {persona.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on: {persona.sourceSongTitle}
                      </p>
                      
                      {/* Characteristics */}
                      {persona.characteristics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {persona.characteristics.map((char) => (
                            <span
                              key={char}
                              className={`text-xs px-2 py-1 rounded-full ${getCharacteristicColor(char)}`}
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(persona.id, e)}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      {persona.isFavorite ? (
                        <StarIconSolid className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <StarIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePersona(persona.id, e)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Persona */}
      <button
        type="button"
        onClick={onCreatePersona}
        disabled={disabled}
        className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Create New Persona from Your Songs</span>
      </button>

      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Personas create custom voices based on your existing songs</p>
        <p>🎤 Each persona captures the vocal style and characteristics</p>
        <p>⭐ Star your favorites for quick access</p>
      </div>
    </div>
  );
}
