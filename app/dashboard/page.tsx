"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { createMusic, getCredits, pollTaskUntilComplete, CreateMusicRequest, MusicTask, CreditsResponse } from "@/lib/ai-music-api";
import { MusicalNoteIcon, SparklesIcon, PlayIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [generatedSongs, setGeneratedSongs] = useState<MusicTask[]>([]);
  
  // Form state
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [musicModel, setMusicModel] = useState<"chirp-v3-5" | "chirp-v4" | "chirp-v4-5" | "chirp-v4-5-plus">("chirp-v3-5");

  const musicStyles = [
    { id: "pop", name: "Pop", description: "Catchy melodies and mainstream appeal" },
    { id: "rock", name: "Rock", description: "Guitar-driven with strong rhythms" },
    { id: "electronic", name: "Electronic", description: "Synthesized sounds and digital beats" },
    { id: "jazz", name: "Jazz", description: "Improvisation and complex harmonies" },
    { id: "classical", name: "Classical", description: "Orchestral and traditional composition" },
    { id: "hip-hop", name: "Hip-Hop", description: "Rhythmic beats and rap vocals" },
    { id: "country", name: "Country", description: "Folk-inspired with storytelling" },
    { id: "ambient", name: "Ambient", description: "Atmospheric and meditative" },
  ];

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
    if (!prompt.trim() || !tags.trim()) {
      alert("Please fill in the prompt and tags fields");
      return;
    }

    console.log('\n🎵 =========================');
    console.log('🎵 FRONTEND: Starting music generation');
    console.log('🎵 =========================');
    console.log('🎵 User inputs:');
    console.log('   - Prompt:', prompt.trim());
    console.log('   - Title:', title.trim() || '(empty)');
    console.log('   - Tags:', tags.trim());
    console.log('   - Style:', selectedStyle || '(none selected)');
    console.log('   - Model:', musicModel);
    console.log('   - Instrumental:', isInstrumental);

    setIsGenerating(true);
    
    try {
      const request: CreateMusicRequest = {
        task_type: "create_music",
        custom_mode: true,
        prompt: prompt.trim(),
        title: title.trim() || undefined,
        tags: tags.trim(),
        mv: musicModel,
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
    setTags("");
    setIsInstrumental(false);
    setSelectedStyle("");
    setGeneratedSongs([]);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Music</h1>
          <p className="text-gray-600">Transform your ideas into studio-quality music with AI</p>
          
          {/* Credits Display */}
          {credits && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              <SparklesIcon className="w-4 h-4" />
              {credits.credits + credits.extra_credits} Credits Available
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
              <h2 className="text-xl font-semibold text-gray-900">Step 1: Describe Your Song</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Description *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A dreamy pop song about summer love with a female vocalist..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={3000}
                />
                <p className="text-xs text-gray-500 mt-1">{prompt.length}/3000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Amazing Song"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre/Mood Tags *
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="pop, upbeat, summer, love"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="instrumental"
                  checked={isInstrumental}
                  onChange={(e) => setIsInstrumental(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="instrumental" className="ml-2 text-sm text-gray-700">
                  Instrumental (no vocals)
                </label>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!prompt.trim() || !tags.trim()}
                className="w-full bg-tuneforge-gradient text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Choose Style
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Choose Your Style (Optional)</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {musicStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedStyle === style.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{style.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Music Model
                </label>
                <select
                  value={musicModel}
                  onChange={(e) => setMusicModel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="chirp-v3-5">Chirp v3.5 (Fastest)</option>
                  <option value="chirp-v4">Chirp v4 (Balanced)</option>
                  <option value="chirp-v4-5">Chirp v4.5 (High Quality)</option>
                  <option value="chirp-v4-5-plus">Chirp v4.5 Plus (Best Quality)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-tuneforge-gradient text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Next: Generate
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
                <p className="text-sm text-gray-600"><strong>Description:</strong> {prompt}</p>
                {title && <p className="text-sm text-gray-600"><strong>Title:</strong> {title}</p>}
                <p className="text-sm text-gray-600"><strong>Tags:</strong> {tags}</p>
                {selectedStyle && <p className="text-sm text-gray-600"><strong>Style:</strong> {selectedStyle}</p>}
                <p className="text-sm text-gray-600"><strong>Model:</strong> {musicModel}</p>
                <p className="text-sm text-gray-600"><strong>Type:</strong> {isInstrumental ? "Instrumental" : "With Vocals"}</p>
              </div>

              {credits && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Credits:</strong> {credits.credits + credits.extra_credits} available • 1 credit will be used
                  </p>
                </div>
              )}

              {isGenerating ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Your masterpiece is being composed...</p>
                  <p className="text-sm text-gray-500 mt-2">This usually takes 15-25 seconds</p>
                </div>
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
                    disabled={!credits || credits.credits + credits.extra_credits < 1}
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
    </DashboardLayout>
  );
}
