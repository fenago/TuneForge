"use client";

import { useState } from "react";
import { SparklesIcon, PlayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { HeartIcon, LightBulbIcon, BoltIcon as ThunderIcon, SunIcon } from "@heroicons/react/24/solid";

interface SurpriseMeInterfaceProps {
  onGenerate: (params: SimpleMusicParams) => void;
  isGenerating?: boolean;
}

export interface SimpleMusicParams {
  mood: string;
  genre: string;
  prompt: string;
  title: string;
  tags: string;
}

const moodOptions = [
  { id: 'happy', label: 'Happy & Uplifting', icon: SunIcon, color: 'text-yellow-500', bg: 'bg-yellow-50 hover:bg-yellow-100' },
  { id: 'energetic', label: 'Energetic & Powerful', icon: ThunderIcon, color: 'text-red-500', bg: 'bg-red-50 hover:bg-red-100' },
  { id: 'romantic', label: 'Romantic & Sweet', icon: HeartIcon, color: 'text-pink-500', bg: 'bg-pink-50 hover:bg-pink-100' },
  { id: 'calm', label: 'Calm & Peaceful', icon: LightBulbIcon, color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100' },
];

const genreOptions = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 
  'Country', 'R&B', 'Reggae', 'Folk', 'Blues', 'Metal'
];

const inspirationPrompts = [
  "A song about chasing dreams",
  "Music for a road trip adventure", 
  "A love song under the stars",
  "Soundtrack for a video game",
  "Music to work out to",
  "A song about overcoming challenges",
  "Background music for studying",
  "A celebration anthem",
  "Music for a rainy day",
  "A song about friendship"
];

export default function SurpriseMeInterface({ onGenerate, isGenerating = false }: SurpriseMeInterfaceProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [inspiration, setInspiration] = useState<string>('');

  const handleSurpriseMe = () => {
    // Auto-select random values for true "surprise me" experience
    const randomMood = moodOptions[Math.floor(Math.random() * moodOptions.length)];
    const randomGenre = genreOptions[Math.floor(Math.random() * genreOptions.length)];
    const randomInspiration = inspirationPrompts[Math.floor(Math.random() * inspirationPrompts.length)];
    
    setSelectedMood(randomMood.id);
    setSelectedGenre(randomGenre);
    setInspiration(randomInspiration);
    
    generateMusic(randomMood.id, randomGenre, randomInspiration);
  };

  const handleGenerate = () => {
    if (!selectedMood || !selectedGenre) {
      alert('Please select a mood and genre first!');
      return;
    }
    
    generateMusic(selectedMood, selectedGenre, inspiration);
  };

  const generateMusic = (mood: string, genre: string, promptInspiration: string) => {
    // Generate AI-enhanced prompt
    const moodDescriptor = moodOptions.find(m => m.id === mood)?.label || mood;
    const enhancedPrompt = promptInspiration 
      ? `Create a ${moodDescriptor.toLowerCase()} ${genre.toLowerCase()} song about ${promptInspiration.toLowerCase()}`
      : `Create a ${moodDescriptor.toLowerCase()} ${genre.toLowerCase()} song`;
    
    // Generate title
    const title = promptInspiration 
      ? promptInspiration.replace(/^(A song about|Music for|Soundtrack for|Background music for)/i, '').trim()
      : `${moodDescriptor} ${genre}`;
    
    // Generate tags
    const tags = `${genre.toLowerCase()}, ${mood}, ${promptInspiration ? getTagsFromPrompt(promptInspiration) : 'original'}`;
    
    const params: SimpleMusicParams = {
      mood,
      genre: genre.toLowerCase(),
      prompt: enhancedPrompt,
      title: title || `My ${genre} Song`,
      tags
    };
    
    onGenerate(params);
  };

  const getTagsFromPrompt = (prompt: string): string => {
    const tagMap: Record<string, string> = {
      'road trip': 'adventure, driving, freedom',
      'video game': 'gaming, epic, action',
      'work out': 'fitness, motivation, energy',
      'studying': 'focus, concentration, ambient',
      'rainy day': 'melancholic, cozy, introspective',
      'friendship': 'heartwarming, unity, joy',
      'celebration': 'party, festive, upbeat',
      'dreams': 'aspirational, hopeful, inspiring',
      'challenges': 'motivational, strength, determination',
      'stars': 'romantic, dreamy, celestial'
    };
    
    for (const [key, value] of Object.entries(tagMap)) {
      if (prompt.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    return 'original, creative';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SparklesIcon className="w-8 h-8 text-tuneforge-blue-violet" />
          <h2 className="text-3xl font-dm-serif font-bold text-gray-900">Surprise Me!</h2>
          <SparklesIcon className="w-8 h-8 text-tuneforge-blue-violet" />
        </div>
        <p className="text-gray-600 text-lg">
          Let AI create the perfect song for you in seconds. Just pick your vibe!
        </p>
      </div>

      {/* Quick Surprise Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleSurpriseMe}
          disabled={isGenerating}
          className="inline-flex items-center gap-3 bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-semibold text-xl px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="w-6 h-6 animate-spin" />
              Creating Magic...
            </>
          ) : (
            <>
              <SparklesIcon className="w-6 h-6" />
              Complete Surprise!
              <SparklesIcon className="w-6 h-6" />
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Or customize your preferences below
        </p>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">What's your mood?</h3>
        <div className="grid grid-cols-2 gap-3">
          {moodOptions.map((mood) => {
            const IconComponent = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedMood === mood.id
                    ? 'border-tuneforge-blue-violet bg-tuneforge-blue-violet/10'
                    : `border-gray-200 ${mood.bg}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-6 h-6 ${mood.color}`} />
                  <span className="font-medium text-gray-900">{mood.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Pick a genre</h3>
        <div className="grid grid-cols-3 gap-2">
          {genreOptions.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedGenre === genre
                  ? 'bg-tuneforge-blue-violet text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Inspiration (Optional) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Need inspiration? <span className="text-gray-500 text-sm font-normal">(optional)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {inspirationPrompts.slice(0, 6).map((prompt, index) => (
            <button
              key={index}
              onClick={() => setInspiration(prompt)}
              className={`p-2 text-left text-sm rounded-lg transition-all duration-200 ${
                inspiration === prompt
                  ? 'bg-tuneforge-medium-purple text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Or describe your own idea..."
          value={inspiration}
          onChange={(e) => setInspiration(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tuneforge-blue-violet focus:border-transparent"
        />
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={!selectedMood || !selectedGenre || isGenerating}
          className="inline-flex items-center gap-3 bg-tuneforge-gradient hover:bg-tuneforge-gradient-reverse text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:scale-105"
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              Generating Your Song...
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              Create My Song
            </>
          )}
        </button>
        
        {selectedMood && selectedGenre && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              <strong>Preview:</strong> Creating a {moodOptions.find(m => m.id === selectedMood)?.label.toLowerCase()} {selectedGenre.toLowerCase()} song
              {inspiration && (
                <span> about {inspiration.toLowerCase()}</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
