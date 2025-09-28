"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ModeToggle, { CreationMode, modeDescriptions } from "@/components/ModeToggle";
import SurpriseMeInterface, { SimpleMusicParams } from "@/components/SurpriseMeInterface";
import AdvancedLoadingExperience from "@/components/AdvancedLoadingExperience";
import { InformationCircleIcon as InfoIcon, CheckCircleIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import { createMusic, getCredits, pollTaskUntilComplete, CreateMusicRequest, MusicTask, CreditsResponse } from "@/lib/ai-music-api";

interface DualModeComposerProps {
  onSongGenerated?: (song: any) => void;
}

export default function DualModeComposer({ onSongGenerated }: DualModeComposerProps) {
  const { data: session } = useSession();
  const [currentMode, setCurrentMode] = useState<CreationMode>('simple');
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [generatedSongs, setGeneratedSongs] = useState<MusicTask[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Advanced mode state (simplified for now)
  const [advancedPrompt, setAdvancedPrompt] = useState("");
  const [advancedTitle, setAdvancedTitle] = useState("");
  const [advancedTags, setAdvancedTags] = useState("");
  const [advancedModel, setAdvancedModel] = useState<"chirp-v3-5" | "chirp-v4" | "chirp-v4-5" | "chirp-v4-5-plus">("chirp-v4");

  // Load credits on mount
  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const creditsData = await getCredits();
      setCredits(creditsData);
    } catch (error) {
      console.error("Failed to load credits:", error);
    }
  };

  const handleSimpleGeneration = async (params: SimpleMusicParams) => {
    console.log('\n✨ =========================');
    console.log('✨ SIMPLE MODE: Starting generation');
    console.log('✨ =========================');
    console.log('✨ Params:', params);

    setIsGenerating(true);
    
    try {
      // Call the simple API endpoint
      const response = await fetch('/api/music/create-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: params.mood,
          genre: params.genre,
          inspiration: params.prompt,
          surprise_mode: false
        })
      });

      if (!response.ok) {
        throw new Error(`Simple API failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Simple generation initiated:', result);

      setCurrentTaskId(result.task_id);

      // Poll for completion
      await pollForCompletion(result.task_id);
      
    } catch (error) {
      console.error('❌ Simple generation failed:', error);
      alert(`Failed to create song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setCurrentTaskId(null);
    }
  };

  const handleAdvancedGeneration = async () => {
    if (!advancedPrompt.trim() || !advancedTitle.trim() || !advancedTags.trim()) {
      alert("Please fill in all required fields: prompt, title, and tags");
      return;
    }

    console.log('\n🔧 =========================');
    console.log('🔧 ADVANCED MODE: Starting generation');
    console.log('🔧 =========================');

    setIsGenerating(true);

    try {
      const request: CreateMusicRequest = {
        task_type: 'create_music',
        custom_mode: true,
        prompt: advancedPrompt.trim(),
        title: advancedTitle.trim(),
        tags: advancedTags.trim(),
        mv: advancedModel
      };

      console.log('🔧 Advanced request:', request);

      const createResponse = await createMusic(request);
      console.log('✅ Advanced generation initiated:', createResponse);

      setCurrentTaskId(createResponse.task_id);

      // Poll for completion
      await pollForCompletion(createResponse.task_id);

    } catch (error) {
      console.error('❌ Advanced generation failed:', error);
      alert(`Failed to create song: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setCurrentTaskId(null);
    }
  };

  const pollForCompletion = async (taskId: string) => {
    try {
      console.log('🔄 Starting polling for task:', taskId);
      
      const completedSongs = await pollTaskUntilComplete(
        taskId,
        (status) => {
          console.log('🔄 Polling status:', status);
        },
        15, // max attempts
        10000 // 10 second intervals
      );

      if (completedSongs && completedSongs.length > 0) {
        console.log('✅ Songs completed:', completedSongs);
        setGeneratedSongs(prev => [...prev, ...completedSongs]);
        
        // Notify parent component
        if (onSongGenerated && completedSongs[0]) {
          onSongGenerated(completedSongs[0]);
        }
      }

      // Reload credits after generation
      await loadCredits();

    } catch (error) {
      console.error('❌ Polling failed:', error);
      alert('Song generation took too long. Check your library for the completed song.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Mode Toggle */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-dm-serif font-bold text-gray-900 mb-4">
          Create Your Perfect Song
        </h1>
        
        <div className="flex flex-col items-center gap-4">
          <ModeToggle 
            currentMode={currentMode} 
            onModeChange={setCurrentMode}
            className="mb-2"
          />
          
          <div className="flex items-center gap-2 text-gray-600 max-w-md">
            <InfoIcon className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{modeDescriptions[currentMode]}</p>
          </div>
        </div>
      </div>

      {/* Credits Display */}
      {credits && (
        <div className="bg-gradient-to-r from-tuneforge-blue-violet/10 to-tuneforge-medium-purple/10 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-tuneforge-blue-violet">
                  {credits.summary.combined_total}
                </p>
                <p className="text-sm text-gray-600">Total Credits</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">
                  {credits.providers.sunoapi_com.total}
                </p>
                <p className="text-xs text-gray-500">SunoAPI.com</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">
                  {credits.providers.sunoapi_org.total}
                </p>
                <p className="text-xs text-gray-500">SunoAPI.org</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Cost per song: ~8-12 credits
              </p>
              <p className="text-xs text-gray-500">
                Updated: {new Date(credits.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Interface */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isGenerating ? (
          <div className="p-8">
            <AdvancedLoadingExperience 
              isGenerating={isGenerating}
              modelId={advancedModel}
              tags={currentMode === 'advanced' ? advancedTags : 'surprise mode'}
              title={currentMode === 'advanced' ? advancedTitle : 'Surprise Song'}
            />
          </div>
        ) : (
          <>
            {currentMode === 'simple' ? (
              <div className="p-6">
                <SurpriseMeInterface 
                  onGenerate={handleSimpleGeneration}
                  isGenerating={isGenerating}
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    Advanced Music Creation
                  </h3>
                  
                  {/* Prompt */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Song Concept *
                    </label>
                    <textarea
                      value={advancedPrompt}
                      onChange={(e) => setAdvancedPrompt(e.target.value)}
                      placeholder="Describe the song you want to create..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      value={advancedTitle}
                      onChange={(e) => setAdvancedTitle(e.target.value)}
                      placeholder="Enter song title..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-transparent"
                    />
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style Tags *
                    </label>
                    <input
                      type="text"
                      value={advancedTags}
                      onChange={(e) => setAdvancedTags(e.target.value)}
                      placeholder="pop, energetic, female vocals, guitar"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>

                  {/* Model Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Model
                    </label>
                    <select
                      value={advancedModel}
                      onChange={(e) => setAdvancedModel(e.target.value as any)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-transparent"
                    >
                      <option value="chirp-v3-5">Chirp v3.5 (Fast)</option>
                      <option value="chirp-v4">Chirp v4 (Balanced)</option>
                      <option value="chirp-v4-5">Chirp v4.5 (High Quality)</option>
                      <option value="chirp-v4-5-plus">Chirp v4.5 Plus (Premium)</option>
                    </select>
                  </div>

                  {/* Generate Button */}
                  <div className="text-center">
                    <button
                      onClick={handleAdvancedGeneration}
                      disabled={!advancedPrompt.trim() || !advancedTitle.trim() || !advancedTags.trim()}
                      className="inline-flex items-center gap-3 bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                    >
                      <MusicalNoteIcon className="w-5 h-5" />
                      Generate Advanced Song
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Songs */}
      {generatedSongs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recently Generated Songs
          </h3>
          <div className="grid gap-4">
            {generatedSongs.slice(0, 3).map((song, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{song.title}</h4>
                    <p className="text-sm text-gray-600">{song.tags}</p>
                    <p className="text-xs text-gray-500">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600">Complete</span>
                  </div>
                </div>
                {song.audio_url && (
                  <audio controls className="w-full mt-3">
                    <source src={song.audio_url} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
