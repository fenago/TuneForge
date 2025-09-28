"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import PersonaSelector from "@/components/PersonaSelector";
import CreatePersonaModal from "@/components/CreatePersonaModal";
import AnnouncementsBanner from "@/components/AnnouncementsBanner";
import { createMusic, getCredits, pollTaskUntilComplete, CreateMusicRequest, MusicTask, CreditsResponse } from "@/lib/ai-music-api";
import { MusicalNoteIcon, SparklesIcon, PlayIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { musicStylesData, getAllStyles, getPopularStyles, searchStyles, MusicStyle, StyleCategory } from "@/data/musicStyles";
import MusicModelSelector from "@/components/MusicModelSelector";
import AdvancedLoadingExperience from "@/components/AdvancedLoadingExperience";

export default function Dashboard() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [generatedSongs, setGeneratedSongs] = useState<MusicTask[]>([]);
  
  // Form state
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [customLyrics, setCustomLyrics] = useState("");
  const [useCustomLyrics, setUseCustomLyrics] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [genderPreference, setGenderPreference] = useState<'male' | 'female' | 'ai-decide'>('ai-decide');
  const [musicModel, setMusicModel] = useState<"chirp-v3-5" | "chirp-v4" | "chirp-v4-5" | "chirp-v4-5-plus">("chirp-v3-5");
  
  // Persona state
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [showCreatePersonaModal, setShowCreatePersonaModal] = useState(false);

  // Style system state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [styleSearchQuery, setStyleSearchQuery] = useState('');
  const [isStyleSearchExpanded, setIsStyleSearchExpanded] = useState(false);


  // Load credits on component mount
  useEffect(() => {
    loadCredits();
    checkPendingSongs();
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
          // Could show a notification here
        }
      }
    } catch (error) {
      console.error('Failed to check pending songs:', error);
    }
  };

  const loadCredits = async () => {
    try {
      const creditsData = await getCredits();
      setCredits(creditsData);
    } catch (error) {
      console.error("Failed to load credits:", error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !title.trim() || !tags.trim()) {
      alert("Please fill in all required fields: concept, title, and tags");
      return;
    }

    // Build final tags with gender preference
    let finalTags = tags.trim();
    
    // Add gender preference to tags if not instrumental and not AI-decide
    if (!isInstrumental && genderPreference !== 'ai-decide') {
      const genderTag = genderPreference === 'male' ? 'male vocals' : 'female vocals';
      if (!finalTags.toLowerCase().includes('male') && !finalTags.toLowerCase().includes('female')) {
        finalTags = `${genderTag}, ${finalTags}`;
      }
    }

    console.log('\n🎵 =========================');
    console.log('🎵 FRONTEND: Starting music generation');
    console.log('🎵 =========================');
    console.log('🎵 User inputs:');
    console.log('   - Prompt:', prompt.trim());
    console.log('   - Title:', title.trim());
    console.log('   - Tags:', finalTags);
    console.log('   - Gender Preference:', genderPreference);
    console.log('   - Custom Lyrics:', useCustomLyrics);
    console.log('   - Model:', musicModel);
    console.log('   - Instrumental:', isInstrumental);

    setIsGenerating(true);
    
    try {
      const request: CreateMusicRequest = {
        task_type: selectedPersonaId ? "persona_music" : "create_music",
        custom_mode: true,
        prompt: useCustomLyrics ? customLyrics.trim() : prompt.trim(),
        title: title.trim(),
        tags: finalTags,
        mv: musicModel,
        persona_id: selectedPersonaId || undefined,
      };

      console.log('📤 FRONTEND: Sending request to /api/music/create');
      console.log('📤 Request payload:', JSON.stringify(request, null, 2));

      // Create the music generation task
      const response = await createMusic(request);
      console.log('📥 FRONTEND: Received response from /api/music/create');
      console.log('📥 Response:', JSON.stringify(response, null, 2));
      
      if (!response.task_id) {
        throw new Error('No task_id received from API');
      }
      
      console.log('🔄 FRONTEND: Starting polling for task:', response.task_id);
      
      // Poll for completion
      const completedTasks = await pollTaskUntilComplete(
        response.task_id,
        (status) => {
          console.log("🔄 FRONTEND: Polling status update:", status);
        }
      );
      
      console.log('✅ FRONTEND: Polling completed');
      console.log('✅ Completed tasks:', JSON.stringify(completedTasks, null, 2));
      
      // Log song durations specifically
      completedTasks.forEach((task, index) => {
        console.log(`🎵 FRONTEND: Song ${index + 1} duration: ${task.duration} seconds`);
        if (task.duration < 30) {
          console.warn(`⚠️  FRONTEND WARNING: Song ${index + 1} is very short: ${task.duration}s`);
        }
      });
      
      setGeneratedSongs(completedTasks);
      setStep(4); // Move to results step
      
      // Refresh credits
      await loadCredits();
      
    } catch (error) {
      console.error("❌ FRONTEND: Music generation failed:", error);
      alert("Failed to generate music. Please try again.");
    } finally {
      setIsGenerating(false);
      console.log('🎵 =========================');
      console.log('🎵 FRONTEND: Music generation complete');
      console.log('🎵 =========================\n');
    }
  };

  const resetForm = () => {
    setStep(1);
    setPrompt("");
    setTitle("");
    setCustomLyrics("");
    setUseCustomLyrics(false);
    setIsInstrumental(false);
    setSelectedStyles([]);
    setTags("");
    setGenderPreference('ai-decide');
    setSelectedPersonaId(null);
    setGeneratedSongs([]);
  };

  const handlePersonaCreated = (persona: any) => {
    setSelectedPersonaId(persona.id);
    console.log('✅ Persona created and selected:', persona.name);
  };

  // Style selection handlers
  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const getFilteredStyles = () => {
    let styles = styleSearchQuery 
      ? searchStyles(styleSearchQuery)
      : getAllStyles();

    if (selectedCategory !== 'all') {
      styles = styles.filter(style => style.category === selectedCategory);
    }

    return styles;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Announcements */}
        <AnnouncementsBanner />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Music</h1>
          <p className="text-gray-600">Transform your ideas into studio-quality music with AI</p>
          
          {/* Credits Display */}
          {credits && credits.success && (
            <div className="mt-4 flex items-center gap-4">
              {/* SunoAPI.com Credits */}
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                .com: {credits.providers.sunoapi_com.total} credits
                {!credits.providers.sunoapi_com.success && (
                  <span className="text-red-500 ml-1">(Error)</span>
                )}
              </div>

              {/* SunoAPI.org Credits */}
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                .org: {credits.providers.sunoapi_org.total} credits
                {!credits.providers.sunoapi_org.success && (
                  <span className="text-red-500 ml-1">(Error)</span>
                )}
              </div>

              {/* Test API Button */}
              <button
                onClick={loadCredits}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Test API
              </button>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? "bg-tuneforge-gradient text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? "bg-tuneforge-gradient" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Describe</span>
            <span>Style</span>
            <span>Generate</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 1: Describe Your Song</h2>
                <p className="text-gray-600">Define your song concept and creative vision</p>
              </div>
              
              {/* Song Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Amazing Song"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={120}
                  required
                />
              </div>

              {/* Song Concept */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Concept & Theme *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A dreamy song about summer love, nostalgic memories of driving down coastal highways..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={3000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {prompt.length}/3000 characters · Describe the theme, mood, and story of your song
                </p>
              </div>

              {/* Custom Lyrics Toggle */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Custom Lyrics (Advanced)
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomLyrics(!useCustomLyrics)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      useCustomLyrics ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        useCustomLyrics ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {useCustomLyrics ? (
                  <div>
                    <textarea
                      value={customLyrics}
                      onChange={(e) => setCustomLyrics(e.target.value)}
                      placeholder="[Verse 1]&#10;Your custom lyrics here...&#10;&#10;[Chorus]&#10;Your chorus lyrics..."
                      className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      maxLength={1900}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {customLyrics.length}/1900 characters · Use song structure tags: [Verse], [Chorus], [Bridge]
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    🎵 AI will generate lyrics based on your song concept above
                  </p>
                )}
              </div>

              {/* Persona Selector */}
              <PersonaSelector
                selectedPersonaId={selectedPersonaId}
                onPersonaSelect={setSelectedPersonaId}
                onCreatePersona={() => setShowCreatePersonaModal(true)}
                disabled={isGenerating}
              />

              {/* Voice Gender Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Voice Gender Preference
                </label>
                <div className="flex space-x-4">
                  {[
                    { value: 'male' as const, label: 'Male Voice', icon: '👨' },
                    { value: 'female' as const, label: 'Female Voice', icon: '👩' },
                    { value: 'ai-decide' as const, label: 'Let AI Decide', icon: '🤖' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGenderPreference(option.value)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border-2 transition-all ${
                        genderPreference === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Instrumental Toggle */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="instrumental"
                  checked={isInstrumental}
                  onChange={(e) => setIsInstrumental(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="instrumental" className="text-sm text-gray-700">
                  <span className="font-medium">Instrumental only</span>
                  <span className="text-gray-500 ml-2">(no vocals)</span>
                </label>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!prompt.trim() || !title.trim()}
                className="w-full bg-tuneforge-gradient text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Choose Musical Styles
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 2: Style & Tags</h2>
                <p className="text-gray-600">Define your sound with tags and styles - combine multiple for fusion!</p>
              </div>

              {/* Tags Input - Primary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Music Tags & Style Keywords *
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="acoustic, pop, soul, r&b, smooth vocals, emotional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {tags.length}/200 characters · Mix genres freely: "acoustic pop soul r&b", "rock electronic", etc.
                </p>
              </div>

              {/* Quick Style Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎵 Quick Style Add-ons (Click to add to tags)
                </label>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Popular Combinations:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'acoustic pop',
                        'electronic rock', 
                        'soul r&b',
                        'indie folk',
                        'jazz fusion',
                        'latin pop'
                      ].map((combo) => (
                        <button
                          key={combo}
                          type="button"
                          onClick={() => setTags(prev => prev ? `${prev}, ${combo}` : combo)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          + {combo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Single Genres:</p>
                    <div className="flex flex-wrap gap-2">
                      {['pop', 'rock', 'electronic', 'hip-hop', 'r&b', 'country', 'jazz', 'classical', 'reggae', 'blues'].map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => setTags(prev => prev ? `${prev}, ${genre}` : genre)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          + {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Moods & Energy:</p>
                    <div className="flex flex-wrap gap-2">
                      {['upbeat', 'mellow', 'energetic', 'chill', 'emotional', 'powerful', 'smooth', 'dreamy'].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setTags(prev => prev ? `${prev}, ${mood}` : mood)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          + {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Model Selection - Prominent */}
              <MusicModelSelector
                selectedModel={musicModel}
                onModelSelect={(modelId) => setMusicModel(modelId as any)}
                tags={tags}
              />

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!tags.trim()}
                  className="flex-1 bg-tuneforge-gradient text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Next: Generate Music
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 3: Generate Your Music</h2>
              
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-gray-900">Generation Summary:</h3>
                <p className="text-sm text-gray-600"><strong>Concept:</strong> {prompt}</p>
                {title && <p className="text-sm text-gray-600"><strong>Title:</strong> {title}</p>}
                <p className="text-sm text-gray-600"><strong>Tags:</strong> {tags}</p>
                <p className="text-sm text-gray-600"><strong>Voice:</strong> {
                  isInstrumental ? "Instrumental" : 
                  genderPreference === 'ai-decide' ? "AI will decide gender" :
                  genderPreference === 'male' ? "Male vocals" : "Female vocals"
                }</p>
                {useCustomLyrics && <p className="text-sm text-gray-600"><strong>Custom Lyrics:</strong> Yes</p>}
                {selectedPersonaId && <p className="text-sm text-gray-600"><strong>Voice Persona:</strong> Selected</p>}
                <p className="text-sm text-gray-600"><strong>Model:</strong> {musicModel}</p>
              </div>

              {credits && credits.success && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Credits:</strong> {credits.grand_total} available • 1 credit will be used
                  </p>
                </div>
              )}

              {isGenerating ? (
                <AdvancedLoadingExperience
                  isGenerating={isGenerating}
                  modelId={musicModel}
                  tags={tags}
                  title={title}
                  onNotificationPreference={(pref) => {
                    console.log('User notification preference:', pref);
                    // Could save to user preferences
                  }}
                />
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!credits || !credits.success || credits.grand_total < 1}
                    className="flex-1 bg-tuneforge-gradient text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <MusicalNoteIcon className="w-5 h-5" />
                    Generate Music
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 4 && generatedSongs.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Music is Ready!</h2>
              
              <div className="grid gap-4">
                {generatedSongs.map((song, index) => (
                  <div key={song.clip_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{song.title}</h3>
                        <p className="text-sm text-gray-600">{song.tags}</p>
                        <p className="text-xs text-gray-500">Duration: {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                          <PlayIcon className="w-4 h-4" />
                        </button>
                        <a
                          href={song.audio_url}
                          download
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    
                    {song.audio_url && (
                      <audio controls className="w-full">
                        <source src={song.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={resetForm}
                className="w-full bg-tuneforge-gradient text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create Another Song
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Persona Modal */}
      <CreatePersonaModal
        isOpen={showCreatePersonaModal}
        onClose={() => setShowCreatePersonaModal(false)}
        onPersonaCreated={handlePersonaCreated}
      />
    </DashboardLayout>
  );
}
