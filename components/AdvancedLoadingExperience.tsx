"use client";

import { useState, useEffect } from 'react';
import { estimateGenerationTime, getModelById } from '@/data/musicModels';
import { 
  MusicalNoteIcon, 
  SparklesIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface AdvancedLoadingExperienceProps {
  isGenerating: boolean;
  modelId: string;
  tags: string;
  title: string;
  onNotificationPreference?: (preference: 'email' | 'browser' | 'none') => void;
}

const generationTips = [
  {
    icon: <MusicalNoteIcon className="w-5 h-5" />,
    title: "AI Music Creation",
    description: "Our AI analyzes your tags and creates unique melodies, harmonies, and rhythms from scratch"
  },
  {
    icon: <SparklesIcon className="w-5 h-5" />,
    title: "Neural Audio Synthesis",
    description: "Advanced neural networks generate high-quality vocals and instruments in real-time"
  },
  {
    icon: <ClockIcon className="w-5 h-5" />,
    title: "Multi-Stage Processing",
    description: "Your song goes through composition, arrangement, mixing, and mastering stages automatically"
  },
  {
    icon: <CheckCircleIcon className="w-5 h-5" />,
    title: "Quality Optimization",
    description: "AI ensures proper EQ, dynamics, and stereo imaging for professional-sounding results"
  }
];

const behindScenesInsights = [
  "🎼 Analyzing your musical DNA and style preferences...",
  "🎹 Generating chord progressions and melody lines...", 
  "🥁 Creating rhythm patterns and drum arrangements...",
  "🎤 Synthesizing vocals with natural expression...",
  "🎚️ Mixing and balancing all musical elements...",
  "✨ Applying final mastering and polish..."
];

export default function AdvancedLoadingExperience({ 
  isGenerating, 
  modelId, 
  tags, 
  title,
  onNotificationPreference 
}: AdvancedLoadingExperienceProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [notificationPref, setNotificationPref] = useState<'email' | 'browser' | 'none'>('none');

  const model = getModelById(modelId);
  const timeEstimate = estimateGenerationTime(modelId, 'moderate');
  
  useEffect(() => {
    if (!isGenerating) {
      setElapsedTime(0);
      setProgress(0);
      setCurrentTipIndex(0);
      setCurrentInsightIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      // Update progress based on elapsed time vs estimate
      setProgress(prev => {
        const newProgress = Math.min((elapsedTime / timeEstimate.estimate) * 100, 95);
        return Math.max(prev, newProgress);
      });

      // Rotate tips every 8 seconds
      if (elapsedTime % 8 === 0) {
        setCurrentTipIndex(prev => (prev + 1) % generationTips.length);
      }

      // Rotate insights every 5 seconds
      if (elapsedTime % 5 === 0) {
        setCurrentInsightIndex(prev => (prev + 1) % behindScenesInsights.length);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, elapsedTime, timeEstimate.estimate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getProgressColor = () => {
    if (progress < 30) return 'from-blue-400 to-blue-600';
    if (progress < 60) return 'from-purple-400 to-purple-600';
    if (progress < 90) return 'from-orange-400 to-orange-600';
    return 'from-green-400 to-green-600';
  };

  const getStatusMessage = () => {
    if (elapsedTime < timeEstimate.estimate * 0.5) return "🎵 Composing your masterpiece...";
    if (elapsedTime < timeEstimate.estimate * 0.8) return "🎚️ Mixing and balancing...";
    if (elapsedTime < timeEstimate.estimate) return "✨ Adding final touches...";
    return "⏳ Almost ready...";
  };

  const getRemainingTime = () => {
    const remaining = Math.max(0, timeEstimate.estimate - elapsedTime);
    return remaining;
  };

  if (!isGenerating) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Music</h3>
        <p className="text-gray-600">"{title}" is being crafted with AI precision</p>
      </div>

      {/* Main Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Animated Progress Bar */}
        <div className="relative mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 relative overflow-hidden`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-600">{Math.round(progress)}% complete</span>
            <span className="text-gray-600">
              {getRemainingTime() > 0 ? `~${formatTime(getRemainingTime())} remaining` : 'Finalizing...'}
            </span>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-900 mb-1">{getStatusMessage()}</p>
          <p className="text-sm text-gray-600">
            Using {model?.displayName} • Elapsed: {formatTime(elapsedTime)}
          </p>
        </div>

        {/* Behind-the-Scenes Insight */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-blue-900">
              {behindScenesInsights[currentInsightIndex]}
            </p>
          </div>
        </div>

        {/* Generation Tip Carousel */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600">
              {generationTips[currentTipIndex].icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {generationTips[currentTipIndex].title}
              </h4>
              <p className="text-sm text-gray-600">
                {generationTips[currentTipIndex].description}
              </p>
            </div>
          </div>
          
          {/* Tip Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {generationTips.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTipIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Safe to Leave Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-green-100 rounded-full p-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-2">
              ✨ Safe to Leave This Page
            </h4>
            <p className="text-sm text-green-800 mb-4">
              Your music generation will continue in the background. We'll notify you when it's ready!
            </p>
            
            {/* Notification Preferences */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-green-900">Get notified when ready:</h5>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'browser' as const, label: 'Browser Notification', icon: <BellIcon className="w-4 h-4" /> },
                  { value: 'email' as const, label: 'Email Alert', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
                  { value: 'none' as const, label: 'No Notifications', icon: <EyeIcon className="w-4 h-4" /> }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setNotificationPref(option.value);
                      onNotificationPreference?.(option.value);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                      notificationPref === option.value
                        ? 'border-green-500 bg-green-100 text-green-700'
                        : 'border-green-200 bg-white text-green-600 hover:border-green-300'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Check Library Later Button */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                📚 Check My Library Later
              </button>
              <p className="text-xs text-green-700 text-center mt-2">
                Your song will appear in your music library when complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance Info */}
      {model && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Generation Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Model:</span>
              <span className="ml-2 font-medium">{model.displayName}</span>
            </div>
            <div>
              <span className="text-gray-500">Expected Quality:</span>
              <span className="ml-2 font-medium">{model.capabilities.audioQuality}/10</span>
            </div>
            <div>
              <span className="text-gray-500">Estimated Time:</span>
              <span className="ml-2 font-medium">{timeEstimate.range[0]}-{timeEstimate.range[1]}s</span>
            </div>
            <div>
              <span className="text-gray-500">Tags:</span>
              <span className="ml-2 font-medium text-xs">{tags.slice(0, 30)}...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
